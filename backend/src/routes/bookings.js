import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import db from '../database/connection.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// Get available time slots for a trainer
router.get('/availability/:trainerId', async (req, res, next) => {
  try {
    const { trainerId } = req.params;
    const {
      date,
      sessionTypeId,
      duration = 60,
      startDate,
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    } = req.query;

    // Validate trainer exists
    const trainer = await db('trainer_profiles')
      .where('user_id', trainerId)
      .first();
    if (!trainer) {
      return next(new ApiError('Trainer not found', 'TRAINER_NOT_FOUND', 404));
    }

    let query = db('availability_slots as slots')
      .where('slots.trainer_id', trainerId)
      .where('slots.is_active', true);

    // If specific date requested
    if (date) {
      const targetDate = new Date(date);
      const dayOfWeek = targetDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();
      query = query.where('slots.day_of_week', dayOfWeek);
    } else {
      // Date range for calendar view
      const start = startDate ? new Date(startDate) : new Date();
      const end = new Date(endDate);

      query = query
        .where(
          'slots.recurrence_start_date',
          '<=',
          end.toISOString().split('T')[0]
        )
        .andWhere(function () {
          this.whereNull('slots.recurrence_end_date').orWhere(
            'slots.recurrence_end_date',
            '>=',
            start.toISOString().split('T')[0]
          );
        });
    }

    const availabilitySlots = await query.select('slots.*');

    // Generate actual time slots for the date range
    const timeSlots = [];
    const sessionDuration = parseInt(duration);

    for (const slot of availabilitySlots) {
      if (date) {
        // Generate slots for specific date
        const slotTimes = generateTimeSlotsForDate(
          slot,
          new Date(date),
          sessionDuration
        );
        timeSlots.push(...slotTimes);
      } else {
        // Generate slots for date range
        const start = startDate ? new Date(startDate) : new Date();
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase();
          if (slot.day_of_week === dayOfWeek) {
            const slotTimes = generateTimeSlotsForDate(
              slot,
              new Date(d),
              sessionDuration
            );
            timeSlots.push(...slotTimes);
          }
        }
      }
    }

    // Check for existing bookings and remove booked slots
    const bookedSlots = await db('bookings')
      .where('trainer_id', trainerId)
      .whereIn('status', ['pending', 'confirmed', 'in_progress'])
      .select('scheduled_at', 'duration_minutes');

    const bookedTimes = new Set(
      bookedSlots.map(booking => new Date(booking.scheduled_at).toISOString())
    );

    const availableSlots = timeSlots.filter(
      slot => !bookedTimes.has(new Date(slot.start_time).toISOString())
    );

    res.json({
      success: true,
      data: {
        trainerId,
        date: date || null,
        dateRange: date
          ? null
          : { start: startDate || new Date(), end: endDate },
        duration: sessionDuration,
        availableSlots: availableSlots.sort(
          (a, b) => new Date(a.start_time) - new Date(b.start_time)
        ),
      },
    });
  } catch (error) {
    logger.error('Error fetching availability:', error);
    next(
      new ApiError('Failed to fetch availability', 'AVAILABILITY_ERROR', 500)
    );
  }
});

// Get trainer's session types
router.get('/session-types/:trainerId', async (req, res, next) => {
  try {
    const { trainerId } = req.params;

    const sessionTypes = await db('session_types')
      .where('trainer_id', trainerId)
      .where('is_active', true)
      .select('*')
      .orderBy('price', 'asc');

    res.json({
      success: true,
      data: { sessionTypes },
    });
  } catch (error) {
    logger.error('Error fetching session types:', error);
    next(
      new ApiError('Failed to fetch session types', 'SESSION_TYPES_ERROR', 500)
    );
  }
});

// Create a new booking
router.post(
  '/',
  authenticate,
  validateRequest([
    'trainerId',
    'sessionTypeId',
    'scheduledAt',
    'sessionFormat',
  ]),
  async (req, res, next) => {
    const trx = await db.transaction();

    try {
      const {
        trainerId,
        sessionTypeId,
        scheduledAt,
        sessionFormat,
        locationDetails,
        clientNotes,
      } = req.body;

      const clientId = req.user.id;

      // Validate session type exists and belongs to trainer
      const sessionType = await trx('session_types')
        .where('id', sessionTypeId)
        .where('trainer_id', trainerId)
        .where('is_active', true)
        .first();

      if (!sessionType) {
        await trx.rollback();
        return next(
          new ApiError('Invalid session type', 'INVALID_SESSION_TYPE', 400)
        );
      }

      // Validate session format is allowed
      if (sessionFormat === 'online' && !sessionType.allows_online) {
        await trx.rollback();
        return next(
          new ApiError(
            'Online sessions not available for this session type',
            'ONLINE_NOT_ALLOWED',
            400
          )
        );
      }

      if (sessionFormat === 'in_person' && !sessionType.allows_in_person) {
        await trx.rollback();
        return next(
          new ApiError(
            'In-person sessions not available for this session type',
            'IN_PERSON_NOT_ALLOWED',
            400
          )
        );
      }

      // Check if time slot is available
      const bookingTime = new Date(scheduledAt);
      const existingBooking = await trx('bookings')
        .where('trainer_id', trainerId)
        .where('scheduled_at', bookingTime.toISOString())
        .whereIn('status', ['pending', 'confirmed', 'in_progress'])
        .first();

      if (existingBooking) {
        await trx.rollback();
        return next(
          new ApiError(
            'Time slot is no longer available',
            'TIME_SLOT_TAKEN',
            409
          )
        );
      }

      // Calculate pricing
      const totalAmount = sessionType.price;
      const platformFee = totalAmount * 0.1; // 10% platform fee
      const trainerPayout = totalAmount - platformFee;

      // Create the booking
      const [bookingId] = await trx('bookings').insert({
        client_id: clientId,
        trainer_id: trainerId,
        session_type_id: sessionTypeId,
        scheduled_at: bookingTime.toISOString(),
        duration_minutes: sessionType.duration_minutes,
        session_format: sessionFormat,
        location_details:
          sessionFormat === 'in_person' ? locationDetails : null,
        status: 'pending',
        total_amount: totalAmount,
        platform_fee: platformFee,
        trainer_payout: trainerPayout,
        payment_status: 'pending',
        client_notes: clientNotes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Get the complete booking data
      const booking = await trx('bookings as b')
        .leftJoin('users as c', 'b.client_id', 'c.id')
        .leftJoin('users as t', 'b.trainer_id', 't.id')
        .leftJoin('trainer_profiles as tp', 'b.trainer_id', 'tp.user_id')
        .leftJoin('session_types as st', 'b.session_type_id', 'st.id')
        .where('b.id', bookingId)
        .select(
          'b.*',
          'c.first_name as client_first_name',
          'c.last_name as client_last_name',
          'c.email as client_email',
          't.first_name as trainer_first_name',
          't.last_name as trainer_last_name',
          'tp.business_name',
          'st.name as session_type_name',
          'st.description as session_type_description'
        )
        .first();

      await trx.commit();

      res.status(201).json({
        success: true,
        data: { booking },
      });
    } catch (error) {
      await trx.rollback();
      logger.error('Error creating booking:', error);
      next(
        new ApiError('Failed to create booking', 'BOOKING_CREATION_ERROR', 500)
      );
    }
  }
);

// Get user's bookings (client or trainer)
router.get('/my-bookings', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      status,
      upcoming = true,
      page = 1,
      limit = 20,
      startDate,
      endDate,
    } = req.query;

    let query = db('bookings as b')
      .leftJoin('users as c', 'b.client_id', 'c.id')
      .leftJoin('users as t', 'b.trainer_id', 't.id')
      .leftJoin('trainer_profiles as tp', 'b.trainer_id', 'tp.user_id')
      .leftJoin('session_types as st', 'b.session_type_id', 'st.id')
      .where(function () {
        this.where('b.client_id', userId).orWhere('b.trainer_id', userId);
      });

    // Filter by status
    if (status) {
      query = query.where('b.status', status);
    }

    // Filter by date range
    if (startDate) {
      query = query.where(
        'b.scheduled_at',
        '>=',
        new Date(startDate).toISOString()
      );
    }
    if (endDate) {
      query = query.where(
        'b.scheduled_at',
        '<=',
        new Date(endDate).toISOString()
      );
    }

    // Filter upcoming/past
    if (upcoming === 'true') {
      query = query.where('b.scheduled_at', '>=', new Date().toISOString());
    } else if (upcoming === 'false') {
      query = query.where('b.scheduled_at', '<', new Date().toISOString());
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const bookings = await query
      .select(
        'b.*',
        'c.first_name as client_first_name',
        'c.last_name as client_last_name',
        'c.email as client_email',
        'c.profile_image_url as client_image',
        't.first_name as trainer_first_name',
        't.last_name as trainer_last_name',
        't.profile_image_url as trainer_image',
        'tp.business_name',
        'st.name as session_type_name',
        'st.description as session_type_description'
      )
      .orderBy('b.scheduled_at', upcoming === 'true' ? 'asc' : 'desc')
      .limit(parseInt(limit))
      .offset(offset);

    // Get total count for pagination
    const totalQuery = db('bookings as b').where(function () {
      this.where('b.client_id', userId).orWhere('b.trainer_id', userId);
    });

    if (status) totalQuery.where('b.status', status);
    if (startDate)
      totalQuery.where(
        'b.scheduled_at',
        '>=',
        new Date(startDate).toISOString()
      );
    if (endDate)
      totalQuery.where('b.scheduled_at', '<=', new Date(endDate).toISOString());
    if (upcoming === 'true')
      totalQuery.where('b.scheduled_at', '>=', new Date().toISOString());
    else if (upcoming === 'false')
      totalQuery.where('b.scheduled_at', '<', new Date().toISOString());

    const [{ count: total }] = await totalQuery.count('* as count');

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(total),
          pages: Math.ceil(parseInt(total) / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    next(new ApiError('Failed to fetch bookings', 'BOOKINGS_FETCH_ERROR', 500));
  }
});

// Update booking status
router.patch(
  '/:bookingId/status',
  authenticate,
  validateRequest(['status']),
  async (req, res, next) => {
    try {
      const { bookingId } = req.params;
      const { status, cancellationReason } = req.body;
      const userId = req.user.id;

      // Validate status
      const validStatuses = ['confirmed', 'cancelled', 'completed', 'no_show'];
      if (!validStatuses.includes(status)) {
        return next(new ApiError('Invalid status', 'INVALID_STATUS', 400));
      }

      // Get the booking
      const booking = await db('bookings')
        .where('id', bookingId)
        .andWhere(function () {
          this.where('client_id', userId).orWhere('trainer_id', userId);
        })
        .first();

      if (!booking) {
        return next(
          new ApiError('Booking not found', 'BOOKING_NOT_FOUND', 404)
        );
      }

      // Update booking
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancelled_by = userId;
        updateData.cancellation_reason = cancellationReason;
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      await db('bookings').where('id', bookingId).update(updateData);

      res.json({
        success: true,
        data: { message: 'Booking status updated successfully' },
      });
    } catch (error) {
      logger.error('Error updating booking status:', error);
      next(
        new ApiError(
          'Failed to update booking status',
          'BOOKING_UPDATE_ERROR',
          500
        )
      );
    }
  }
);

// Helper function to generate time slots for a specific date
function generateTimeSlotsForDate(availabilitySlot, date, sessionDuration) {
  const slots = [];
  const slotStart = new Date(availabilitySlot.start_time);
  const slotEnd = new Date(availabilitySlot.end_time);

  // Get the time components from the availability slot
  const startHours = slotStart.getHours();
  const startMinutes = slotStart.getMinutes();
  const endHours = slotEnd.getHours();
  const endMinutes = slotEnd.getMinutes();

  // Create start and end times for the specific date
  const dayStart = new Date(date);
  dayStart.setHours(startHours, startMinutes, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHours, endMinutes, 0, 0);

  // Generate slots
  let currentTime = new Date(dayStart);

  while (currentTime < dayEnd) {
    const slotEndTime = new Date(
      currentTime.getTime() + sessionDuration * 60000
    );

    // Check if the slot fits within the availability window
    if (slotEndTime <= dayEnd) {
      slots.push({
        start_time: new Date(currentTime).toISOString(),
        end_time: slotEndTime.toISOString(),
        duration_minutes: sessionDuration,
        availability_slot_id: availabilitySlot.id,
      });
    }

    // Move to next slot (default 30-minute intervals)
    currentTime.setMinutes(currentTime.getMinutes() + 30);
  }

  return slots;
}

export default router;
