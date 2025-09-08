import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import db from '../database/connection.js';

const router = express.Router();

/**
 * @route   GET /api/trainers/specialties
 * @desc    Get all available specialties
 * @access  Public
 */
router.get(
  '/specialties',
  asyncHandler(async (req, res) => {
    const specialties = await db('specialties')
      .where('is_active', true)
      .orderBy('sort_order')
      .orderBy('name');

    res.json({
      success: true,
      data: {
        specialties,
      },
    });
  })
);

/**
 * @route   GET /api/trainers
 * @desc    Search and filter trainers
 * @access  Public
 */
router.get(
  '/',
  [
    query('search').optional().isString().trim(),
    query('specialty').optional().isInt({ min: 1 }),
    query('city').optional().isString().trim(),
    query('state').optional().isString().trim(),
    query('min_rating').optional().isFloat({ min: 0, max: 5 }),
    query('verified_only').optional().isBoolean(),
    query('online_sessions').optional().isBoolean(),
    query('in_person_sessions').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    const {
      search,
      specialty,
      city,
      state,
      min_rating,
      verified_only,
      online_sessions,
      in_person_sessions,
      page = 1,
      limit = 12,
    } = req.query;

    const offset = (page - 1) * limit;

    // Build the query
    let query = db('trainer_profiles as tp')
      .join('users as u', 'tp.user_id', 'u.id')
      .leftJoin('trainer_specialties as ts', 'tp.user_id', 'ts.trainer_id')
      .leftJoin('specialties as s', 'ts.specialty_id', 's.id')
      .where('u.is_active', true)
      .where('tp.is_accepting_clients', true)
      .select(
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.profile_image_url',
        'tp.business_name',
        'tp.bio',
        'tp.experience_years',
        'tp.city',
        'tp.state',
        'tp.rating',
        'tp.review_count',
        'tp.is_verified',
        'tp.subscription_tier',
        'tp.offers_online_sessions',
        'tp.offers_in_person_sessions',
        db.raw('GROUP_CONCAT(s.name) as specialties'),
        db.raw('GROUP_CONCAT(s.id) as specialty_ids')
      )
      .groupBy('u.id');

    // Apply filters
    if (search) {
      query = query.where(function () {
        this.where('u.first_name', 'like', `%${search}%`)
          .orWhere('u.last_name', 'like', `%${search}%`)
          .orWhere('tp.business_name', 'like', `%${search}%`)
          .orWhere('tp.bio', 'like', `%${search}%`)
          .orWhere('s.name', 'like', `%${search}%`);
      });
    }

    if (specialty) {
      query = query.where('ts.specialty_id', specialty);
    }

    if (city) {
      query = query.where('tp.city', 'like', `%${city}%`);
    }

    if (state) {
      query = query.where('tp.state', 'like', `%${state}%`);
    }

    if (min_rating) {
      query = query.where('tp.rating', '>=', min_rating);
    }

    if (verified_only === 'true') {
      query = query.where('tp.is_verified', true);
    }

    if (online_sessions === 'true') {
      query = query.where('tp.offers_online_sessions', true);
    }

    if (in_person_sessions === 'true') {
      query = query.where('tp.offers_in_person_sessions', true);
    }

    // Get total count for pagination
    const countQuery = db('trainer_profiles as tp')
      .join('users as u', 'tp.user_id', 'u.id')
      .leftJoin('trainer_specialties as ts', 'tp.user_id', 'ts.trainer_id')
      .leftJoin('specialties as s', 'ts.specialty_id', 's.id')
      .where('u.is_active', true)
      .where('tp.is_accepting_clients', true);

    // Apply the same filters to count query
    if (search) {
      countQuery.where(function () {
        this.where('u.first_name', 'like', `%${search}%`)
          .orWhere('u.last_name', 'like', `%${search}%`)
          .orWhere('tp.business_name', 'like', `%${search}%`)
          .orWhere('tp.bio', 'like', `%${search}%`)
          .orWhere('s.name', 'like', `%${search}%`);
      });
    }

    if (specialty) {
      countQuery.where('ts.specialty_id', specialty);
    }

    if (city) {
      countQuery.where('tp.city', 'like', `%${city}%`);
    }

    if (state) {
      countQuery.where('tp.state', 'like', `%${state}%`);
    }

    if (min_rating) {
      countQuery.where('tp.rating', '>=', min_rating);
    }

    if (verified_only === 'true') {
      countQuery.where('tp.is_verified', true);
    }

    if (online_sessions === 'true') {
      countQuery.where('tp.offers_online_sessions', true);
    }

    if (in_person_sessions === 'true') {
      countQuery.where('tp.offers_in_person_sessions', true);
    }

    const totalResult = await countQuery.countDistinct('u.id as total');
    const total = parseInt(totalResult[0].total);

    // Get paginated results
    const trainers = await query
      .orderBy('tp.rating', 'desc')
      .orderBy('tp.review_count', 'desc')
      .limit(limit)
      .offset(offset);

    // Format the results
    const formattedTrainers = trainers.map(trainer => ({
      id: trainer.id,
      firstName: trainer.first_name,
      lastName: trainer.last_name,
      profileImageUrl: trainer.profile_image_url,
      businessName: trainer.business_name,
      bio: trainer.bio,
      experienceYears: trainer.experience_years,
      location: {
        city: trainer.city,
        state: trainer.state,
      },
      rating: parseFloat(trainer.rating),
      reviewCount: trainer.review_count,
      isVerified: trainer.is_verified,
      subscriptionTier: trainer.subscription_tier,
      offers: {
        onlineSessions: trainer.offers_online_sessions,
        inPersonSessions: trainer.offers_in_person_sessions,
      },
      specialties: trainer.specialties ? trainer.specialties.split(',') : [],
      specialtyIds: trainer.specialty_ids
        ? trainer.specialty_ids.split(',').map(id => parseInt(id))
        : [],
    }));

    res.json({
      success: true,
      data: {
        trainers: formattedTrainers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  })
);

/**
 * @route   GET /api/trainers/:id
 * @desc    Get trainer profile by ID
 * @access  Public
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get trainer profile
    const trainer = await db('trainer_profiles as tp')
      .join('users as u', 'tp.user_id', 'u.id')
      .where('u.id', id)
      .where('u.is_active', true)
      .select(
        'u.id',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.phone_number',
        'u.profile_image_url',
        'u.created_at',
        'tp.*'
      )
      .first();

    if (!trainer) {
      throw new ApiError('Trainer not found', 404, 'TRAINER_NOT_FOUND');
    }

    // Get trainer specialties
    const specialties = await db('trainer_specialties as ts')
      .join('specialties as s', 'ts.specialty_id', 's.id')
      .where('ts.trainer_id', id)
      .select(
        's.id',
        's.name',
        's.slug',
        's.description',
        's.icon_name',
        's.color',
        'ts.experience_years',
        'ts.is_primary'
      )
      .orderBy('ts.is_primary', 'desc')
      .orderBy('s.name');

    // Parse social links
    let socialLinks = {};
    try {
      socialLinks = trainer.social_links
        ? JSON.parse(trainer.social_links)
        : {};
    } catch (error) {
      socialLinks = {};
    }

    const formattedTrainer = {
      id: trainer.id,
      firstName: trainer.first_name,
      lastName: trainer.last_name,
      email: trainer.email,
      phoneNumber: trainer.phone_number,
      profileImageUrl: trainer.profile_image_url,
      businessName: trainer.business_name,
      bio: trainer.bio,
      experienceYears: trainer.experience_years,
      location: {
        address: trainer.address,
        city: trainer.city,
        state: trainer.state,
        zipCode: trainer.zip_code,
        country: trainer.country,
        coordinates: {
          latitude: parseFloat(trainer.latitude),
          longitude: parseFloat(trainer.longitude),
        },
      },
      rating: parseFloat(trainer.rating),
      reviewCount: trainer.review_count,
      isVerified: trainer.is_verified,
      subscriptionTier: trainer.subscription_tier,
      socialLinks,
      offers: {
        onlineSessions: trainer.offers_online_sessions,
        inPersonSessions: trainer.offers_in_person_sessions,
      },
      isAcceptingClients: trainer.is_accepting_clients,
      specialties: specialties.map(spec => ({
        id: spec.id,
        name: spec.name,
        slug: spec.slug,
        description: spec.description,
        iconName: spec.icon_name,
        color: spec.color,
        experienceYears: spec.experience_years,
        isPrimary: spec.is_primary,
      })),
      memberSince: trainer.created_at,
    };

    res.json({
      success: true,
      data: {
        trainer: formattedTrainer,
      },
    });
  })
);

/**
 * @route   POST /api/trainers/profile
 * @desc    Create or update trainer profile
 * @access  Private (Trainers only)
 */
router.post(
  '/profile',
  authenticate,
  authorize('trainer'),
  [
    body('businessName').optional().trim(),
    body('bio').notEmpty().withMessage('Bio is required'),
    body('experienceYears')
      .isInt({ min: 0 })
      .withMessage('Experience years must be a positive number'),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('zipCode').notEmpty().withMessage('Zip code is required'),
    body('specialties')
      .isArray({ min: 1 })
      .withMessage('At least one specialty is required'),
    body('sessionTypes').optional().isArray(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR');
    }

    const userId = req.user.id;
    const {
      businessName,
      bio,
      experienceYears,
      address,
      city,
      state,
      zipCode,
      specialties,
      sessionTypes = [],
      offersOnline = false,
      offersInPerson = true,
      socialLinks = {},
    } = req.body;

    // Start transaction
    const trx = await db.transaction();

    try {
      // Check if profile exists
      const existingProfile = await trx('trainer_profiles')
        .where('user_id', userId)
        .first();

      const profileData = {
        business_name: businessName,
        bio,
        experience_years: experienceYears,
        address,
        city,
        state,
        zip_code: zipCode,
        offers_online_sessions: offersOnline,
        offers_in_person_sessions: offersInPerson,
        social_links: JSON.stringify(socialLinks),
        updated_at: new Date(),
      };

      if (existingProfile) {
        // Update existing profile
        await trx('trainer_profiles')
          .where('user_id', userId)
          .update(profileData);
      } else {
        // Create new profile
        await trx('trainer_profiles').insert({
          user_id: userId,
          ...profileData,
          created_at: new Date(),
        });
      }

      // Update specialties
      await trx('trainer_specialties').where('trainer_id', userId).del();

      if (specialties.length > 0) {
        const specialtyInserts = specialties.map((specialty, index) => ({
          trainer_id: userId,
          specialty_id: specialty.id,
          experience_years: specialty.experienceYears || 0,
          is_primary: index === 0,
          created_at: new Date(),
          updated_at: new Date(),
        }));

        await trx('trainer_specialties').insert(specialtyInserts);
      }

      // Update session types
      await trx('session_types').where('trainer_id', userId).del();

      if (sessionTypes.length > 0) {
        const sessionTypeInserts = sessionTypes.map(st => ({
          trainer_id: userId,
          name: st.name,
          description: st.description,
          duration_minutes: st.duration,
          price: st.price,
          type: st.type || 'individual',
          max_participants: st.maxParticipants || 1,
          min_participants: st.minParticipants || 1,
          allows_online: st.allowsOnline || false,
          allows_in_person: st.allowsInPerson || true,
          created_at: new Date(),
          updated_at: new Date(),
        }));

        await trx('session_types').insert(sessionTypeInserts);
      }

      await trx.commit();

      res.json({
        success: true,
        message: 'Trainer profile updated successfully',
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  })
);

export default router;
