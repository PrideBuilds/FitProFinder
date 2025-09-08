import express from 'express';
import knex from '../database/connection.js';
import paymentService from '../services/paymentService.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

/**
 * Create a payment intent for a booking
 * POST /api/payments/create-intent
 */
router.post(
  '/create-intent',
  validateRequest([
    { field: 'sessionTypeId', type: 'string', required: true },
    { field: 'trainerId', type: 'string', required: true },
    { field: 'bookingId', type: 'string', required: false },
  ]),
  async (req, res, next) => {
    try {
      const { sessionTypeId, trainerId, bookingId } = req.body;
      const user = req.user;

      const result = await paymentService.createPaymentIntent(
        {
          sessionTypeId,
          trainerId,
          bookingId,
        },
        user
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Confirm a payment after successful charge
 * POST /api/payments/confirm
 */
router.post(
  '/confirm',
  validateRequest([
    { field: 'paymentIntentId', type: 'string', required: true },
    { field: 'bookingId', type: 'string', required: true },
  ]),
  async (req, res, next) => {
    try {
      const { paymentIntentId, bookingId } = req.body;

      const result = await paymentService.confirmPayment(
        paymentIntentId,
        bookingId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get payment breakdown for a session type
 * GET /api/payments/breakdown/:sessionTypeId
 */
router.get('/breakdown/:sessionTypeId', async (req, res, next) => {
  try {
    const { sessionTypeId } = req.params;

    // Get session type
    const sessionType = await knex('session_types')
      .where('id', sessionTypeId)
      .first();

    if (!sessionType) {
      throw new ApiError('Session type not found', 404);
    }

    const breakdown = paymentService.calculatePaymentBredown(sessionType.price);

    res.json({
      success: true,
      data: {
        sessionType: {
          id: sessionType.id,
          name: sessionType.name,
          price: sessionType.price,
        },
        breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get payment history for the current user
 * GET /api/payments/history
 */
router.get('/history', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;

    const result = await paymentService.getPaymentHistory(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Process a refund (admin/trainer only)
 * POST /api/payments/:paymentId/refund
 */
router.post(
  '/:paymentId/refund',
  validateRequest([
    { field: 'amount', type: 'number', required: false },
    { field: 'reason', type: 'string', required: false },
  ]),
  async (req, res, next) => {
    try {
      const { paymentId } = req.params;
      const { amount, reason = 'requested_by_customer' } = req.body;
      const user = req.user;

      // Check if user is authorized to refund this payment
      // (For now, only allow the client or admin to request refunds)
      const payment = await knex('payments').where('id', paymentId).first();

      if (!payment) {
        throw new ApiError('Payment not found', 404);
      }

      if (payment.client_id !== user.id && user.role !== 'admin') {
        throw new ApiError('Not authorized to refund this payment', 403);
      }

      const result = await paymentService.processRefund(
        paymentId,
        amount,
        reason
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get trainer earnings (trainers only)
 * GET /api/payments/earnings
 */
router.get('/earnings', async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== 'trainer') {
      throw new ApiError('Only trainers can view earnings', 403);
    }

    const { startDate, endDate } = req.query;

    const earnings = await paymentService.getTrainerEarnings(user.id, {
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Save a payment method for future use
 * POST /api/payments/payment-methods
 */
router.post(
  '/payment-methods',
  validateRequest([
    { field: 'paymentMethodId', type: 'string', required: true },
    { field: 'isDefault', type: 'boolean', required: false },
  ]),
  async (req, res, next) => {
    try {
      const { paymentMethodId, isDefault = false } = req.body;
      const user = req.user;

      const result = await paymentService.savePaymentMethod(
        user.id,
        paymentMethodId,
        isDefault
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get saved payment methods
 * GET /api/payments/payment-methods
 */
router.get('/payment-methods', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const paymentMethods = await knex('payment_methods')
      .where('user_id', userId)
      .where('is_active', true)
      .orderBy('is_default', 'desc')
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: { paymentMethods },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a saved payment method
 * DELETE /api/payments/payment-methods/:paymentMethodId
 */
router.delete('/payment-methods/:paymentMethodId', async (req, res, next) => {
  try {
    const { paymentMethodId } = req.params;
    const userId = req.user.id;

    // Mark as inactive instead of deleting (for audit trail)
    const updated = await knex('payment_methods')
      .where('id', paymentMethodId)
      .where('user_id', userId)
      .update({ is_active: false });

    if (!updated) {
      throw new ApiError('Payment method not found', 404);
    }

    res.json({
      success: true,
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
