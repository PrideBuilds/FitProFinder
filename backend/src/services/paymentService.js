import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import knex from '../database/connection.js';
import ApiError from '../utils/ApiError.js';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2023-10-16',
});

class PaymentService {
  constructor() {
    this.platformFeePercentage = 0.15; // 15% platform fee
    this.stripeFeePercentage = 0.029; // 2.9% + 30¢ Stripe fee
    this.stripeFeeFixed = 30; // 30 cents in cents
  }

  /**
   * Calculate fees and amounts for a payment
   */
  calculatePaymentBredown(amount) {
    const totalAmountCents = Math.round(amount * 100);

    // Calculate Stripe fees
    const stripeFee =
      Math.round(totalAmountCents * this.stripeFeePercentage) +
      this.stripeFeeFixed;

    // Calculate platform fee on the remaining amount after Stripe fees
    const amountAfterStripe = totalAmountCents - stripeFee;
    const platformFee = Math.round(
      amountAfterStripe * this.platformFeePercentage
    );

    // Trainer receives the rest
    const trainerAmount = amountAfterStripe - platformFee;

    return {
      totalAmount: totalAmountCents / 100,
      platformFee: platformFee / 100,
      trainerAmount: trainerAmount / 100,
      stripeFee: stripeFee / 100,
    };
  }

  /**
   * Create or retrieve a Stripe customer
   */
  async createOrGetCustomer(user) {
    try {
      // Check if user already has a Stripe customer ID
      const existingCustomer = await knex('users')
        .where('id', user.id)
        .select('stripe_customer_id')
        .first();

      if (existingCustomer?.stripe_customer_id) {
        return existingCustomer.stripe_customer_id;
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          user_id: user.id,
          platform: 'fitprofinder',
        },
      });

      // Save customer ID to database
      await knex('users')
        .where('id', user.id)
        .update({ stripe_customer_id: customer.id });

      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new ApiError('Failed to set up payment customer', 500);
    }
  }

  /**
   * Create a payment intent for a booking
   */
  async createPaymentIntent(bookingData, user) {
    const trx = await knex.transaction();

    try {
      // Get session type details
      const sessionType = await trx('session_types')
        .where('id', bookingData.sessionTypeId)
        .first();

      if (!sessionType) {
        throw new ApiError('Session type not found', 404);
      }

      // Calculate payment breakdown
      const breakdown = this.calculatePaymentBredown(sessionType.price);

      // Create or get Stripe customer
      const customerId = await this.createOrGetCustomer(user);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(breakdown.totalAmount * 100), // Amount in cents
        currency: 'usd',
        customer: customerId,
        metadata: {
          booking_id: bookingData.bookingId || 'pending',
          session_type_id: bookingData.sessionTypeId,
          trainer_id: bookingData.trainerId,
          client_id: user.id,
          platform: 'fitprofinder',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Create payment record
      const paymentId = uuidv4();
      await trx('payments').insert({
        id: paymentId,
        booking_id: bookingData.bookingId || null,
        client_id: user.id,
        trainer_id: bookingData.trainerId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: breakdown.totalAmount,
        platform_fee: breakdown.platformFee,
        trainer_amount: breakdown.trainerAmount,
        status: 'pending',
      });

      await trx.commit();

      return {
        paymentIntent: {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
          amount: breakdown.totalAmount,
        },
        breakdown,
        paymentId,
      };
    } catch (error) {
      await trx.rollback();
      console.error('Error creating payment intent:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError('Failed to create payment intent', 500);
    }
  }

  /**
   * Confirm payment and update booking
   */
  async confirmPayment(paymentIntentId, bookingId) {
    const trx = await knex.transaction();

    try {
      // Retrieve payment intent from Stripe
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new ApiError('Payment not successful', 400);
      }

      // Update payment record
      await trx('payments')
        .where('stripe_payment_intent_id', paymentIntentId)
        .update({
          booking_id: bookingId,
          status: 'succeeded',
          payment_method_details: JSON.stringify({
            payment_method: paymentIntent.payment_method,
            charges: paymentIntent.charges?.data?.[0],
          }),
          receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url,
        });

      // Update booking status to confirmed
      await trx('bookings').where('id', bookingId).update({
        status: 'confirmed',
        payment_status: 'paid',
      });

      await trx.commit();

      return {
        success: true,
        receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url,
      };
    } catch (error) {
      await trx.rollback();
      console.error('Error confirming payment:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError('Failed to confirm payment', 500);
    }
  }

  /**
   * Process a refund
   */
  async processRefund(
    paymentId,
    amount = null,
    reason = 'requested_by_customer'
  ) {
    const trx = await knex.transaction();

    try {
      // Get payment record
      const payment = await trx('payments').where('id', paymentId).first();

      if (!payment) {
        throw new ApiError('Payment not found', 404);
      }

      if (payment.status !== 'succeeded') {
        throw new ApiError('Payment cannot be refunded', 400);
      }

      // Calculate refund amount (full refund if not specified)
      const refundAmount = amount || payment.amount;

      if (refundAmount > payment.amount - payment.refunded_amount) {
        throw new ApiError('Refund amount exceeds available amount', 400);
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
        amount: Math.round(refundAmount * 100), // Amount in cents
        reason: reason,
        metadata: {
          payment_id: paymentId,
          platform: 'fitprofinder',
        },
      });

      // Update payment record
      const newRefundedAmount =
        parseFloat(payment.refunded_amount) + refundAmount;
      const newStatus =
        newRefundedAmount >= payment.amount ? 'refunded' : 'partially_refunded';

      await trx('payments').where('id', paymentId).update({
        status: newStatus,
        refunded_amount: newRefundedAmount,
        refund_reason: reason,
        refunded_at: new Date(),
      });

      // Update booking status if fully refunded
      if (newStatus === 'refunded') {
        await trx('bookings').where('id', payment.booking_id).update({
          status: 'cancelled',
          payment_status: 'refunded',
        });
      }

      await trx.commit();

      return {
        success: true,
        refund_id: refund.id,
        refunded_amount: refundAmount,
        total_refunded: newRefundedAmount,
      };
    } catch (error) {
      await trx.rollback();
      console.error('Error processing refund:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError('Failed to process refund', 500);
    }
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(
    userId,
    { page = 1, limit = 10, status = null } = {}
  ) {
    try {
      let query = knex('payments')
        .select([
          'payments.*',
          'bookings.scheduled_at',
          'session_types.name as session_name',
          'trainer_profiles.business_name',
          'trainer_users.first_name as trainer_first_name',
          'trainer_users.last_name as trainer_last_name',
        ])
        .leftJoin('bookings', 'payments.booking_id', 'bookings.id')
        .leftJoin(
          'session_types',
          'bookings.session_type_id',
          'session_types.id'
        )
        .leftJoin(
          'trainer_profiles',
          'payments.trainer_id',
          'trainer_profiles.user_id'
        )
        .leftJoin(
          'users as trainer_users',
          'payments.trainer_id',
          'trainer_users.id'
        )
        .where('payments.client_id', userId)
        .orderBy('payments.created_at', 'desc');

      if (status) {
        query = query.where('payments.status', status);
      }

      const offset = (page - 1) * limit;
      const payments = await query.limit(limit).offset(offset);

      const totalCount = await knex('payments')
        .where('client_id', userId)
        .modify(builder => {
          if (status) {
            builder.where('status', status);
          }
        })
        .count('* as count')
        .first();

      return {
        payments,
        pagination: {
          page,
          limit,
          total: parseInt(totalCount.count),
          pages: Math.ceil(parseInt(totalCount.count) / limit),
        },
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw new ApiError('Failed to retrieve payment history', 500);
    }
  }

  /**
   * Get earnings for a trainer
   */
  async getTrainerEarnings(
    trainerId,
    { startDate = null, endDate = null } = {}
  ) {
    try {
      let query = knex('payments')
        .select([
          knex.raw('SUM(trainer_amount) as total_earnings'),
          knex.raw('SUM(platform_fee) as total_fees'),
          knex.raw('COUNT(*) as total_sessions'),
          knex.raw(
            'SUM(CASE WHEN trainer_paid = 1 THEN trainer_amount ELSE 0 END) as paid_amount'
          ),
          knex.raw(
            'SUM(CASE WHEN trainer_paid = 0 THEN trainer_amount ELSE 0 END) as pending_amount'
          ),
        ])
        .where('trainer_id', trainerId)
        .where('status', 'succeeded');

      if (startDate) {
        query = query.where('created_at', '>=', startDate);
      }

      if (endDate) {
        query = query.where('created_at', '<=', endDate);
      }

      const earnings = await query.first();

      return {
        total_earnings: parseFloat(earnings.total_earnings) || 0,
        total_fees: parseFloat(earnings.total_fees) || 0,
        total_sessions: parseInt(earnings.total_sessions) || 0,
        paid_amount: parseFloat(earnings.paid_amount) || 0,
        pending_amount: parseFloat(earnings.pending_amount) || 0,
      };
    } catch (error) {
      console.error('Error getting trainer earnings:', error);
      throw new ApiError('Failed to retrieve trainer earnings', 500);
    }
  }

  /**
   * Save a payment method for future use
   */
  async savePaymentMethod(userId, paymentMethodId, isDefault = false) {
    const trx = await knex.transaction();

    try {
      // Get payment method details from Stripe
      const paymentMethod =
        await stripe.paymentMethods.retrieve(paymentMethodId);

      if (paymentMethod.type !== 'card') {
        throw new ApiError('Only card payment methods are supported', 400);
      }

      const customerId = await this.createOrGetCustomer({ id: userId });

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // If this is the default, unset other defaults
      if (isDefault) {
        await trx('payment_methods')
          .where('user_id', userId)
          .update({ is_default: false });
      }

      // Save payment method to database
      const paymentMethodRecord = {
        id: uuidv4(),
        user_id: userId,
        stripe_payment_method_id: paymentMethodId,
        stripe_customer_id: customerId,
        card_brand: paymentMethod.card.brand,
        card_last_four: paymentMethod.card.last4,
        card_exp_month: paymentMethod.card.exp_month,
        card_exp_year: paymentMethod.card.exp_year,
        card_country: paymentMethod.card.country,
        is_default: isDefault,
        billing_name: paymentMethod.billing_details?.name,
        billing_email: paymentMethod.billing_details?.email,
        billing_phone: paymentMethod.billing_details?.phone,
        billing_line1: paymentMethod.billing_details?.address?.line1,
        billing_line2: paymentMethod.billing_details?.address?.line2,
        billing_city: paymentMethod.billing_details?.address?.city,
        billing_state: paymentMethod.billing_details?.address?.state,
        billing_postal_code:
          paymentMethod.billing_details?.address?.postal_code,
        billing_country: paymentMethod.billing_details?.address?.country,
      };

      await trx('payment_methods').insert(paymentMethodRecord);

      await trx.commit();

      return paymentMethodRecord;
    } catch (error) {
      await trx.rollback();
      console.error('Error saving payment method:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError('Failed to save payment method', 500);
    }
  }
}

export default new PaymentService();
