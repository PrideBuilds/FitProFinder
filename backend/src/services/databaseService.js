/**
 * Database Service
 * Centralized database operations with query optimization and caching
 */

import db from '../database/connection.js';
import { logger } from '../utils/logger.js';
import { CACHE } from '../constants.js';

class DatabaseService {
  constructor() {
    this.cache = new Map();
    this.queryStats = new Map();
  }

  /**
   * Execute a query with caching and performance monitoring
   * @param {string} queryName - Name for caching and monitoring
   * @param {Function} queryFn - Function that returns a query builder
   * @param {Object} options - Query options
   * @returns {Promise<any>} Query result
   */
  async executeQuery(queryName, queryFn, options = {}) {
    const startTime = Date.now();
    const { useCache = true, ttl = CACHE.TTL.MEDIUM, cacheKey = null } = options;

    try {
      // Check cache first
      if (useCache) {
        const key = cacheKey || queryName;
        const cached = this.getFromCache(key);
        if (cached) {
          logger.debug(`Cache hit for query: ${queryName}`);
          return cached;
        }
      }

      // Execute query
      const result = await queryFn();
      const executionTime = Date.now() - startTime;

      // Update query stats
      this.updateQueryStats(queryName, executionTime);

      // Cache result
      if (useCache && result) {
        const key = cacheKey || queryName;
        this.setCache(key, result, ttl);
      }

      logger.debug(`Query executed: ${queryName} (${executionTime}ms)`);
      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error(`Query failed: ${queryName} (${executionTime}ms)`, error);
      throw error;
    }
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {any} Cached data or null
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  setCache(key, data, ttl) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Clear cache
   * @param {string} pattern - Pattern to match keys (optional)
   */
  clearCache(pattern = null) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Update query performance statistics
   * @param {string} queryName - Query name
   * @param {number} executionTime - Execution time in milliseconds
   */
  updateQueryStats(queryName, executionTime) {
    const stats = this.queryStats.get(queryName) || {
      count: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      avgTime: 0,
    };

    stats.count++;
    stats.totalTime += executionTime;
    stats.minTime = Math.min(stats.minTime, executionTime);
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    stats.avgTime = stats.totalTime / stats.count;

    this.queryStats.set(queryName, stats);
  }

  /**
   * Get query performance statistics
   * @returns {Object} Query statistics
   */
  getQueryStats() {
    return Object.fromEntries(this.queryStats);
  }

  // User Operations
  async getUserById(id, useCache = true) {
    return this.executeQuery(
      `user_${id}`,
      () => db('users').where({ id, is_active: true }).first(),
      { useCache, ttl: CACHE.TTL.MEDIUM }
    );
  }

  async getUserByEmail(email, useCache = true) {
    return this.executeQuery(
      `user_email_${email}`,
      () => db('users').where({ email, is_active: true }).first(),
      { useCache, ttl: CACHE.TTL.SHORT }
    );
  }

  async getUsers(filters = {}, pagination = {}) {
    const { page = 1, limit = 10, role, isVerified, search } = filters;
    const offset = (page - 1) * limit;

    return this.executeQuery(
      `users_${JSON.stringify(filters)}`,
      async () => {
        let query = db('users').where({ is_active: true });

        if (role) query = query.where({ role });
        if (isVerified !== undefined) query = query.where({ is_verified: isVerified });
        if (search) {
          query = query.where(function() {
            this.where('first_name', 'like', `%${search}%`)
                .orWhere('last_name', 'like', `%${search}%`)
                .orWhere('email', 'like', `%${search}%`);
          });
        }

        const [users, totalCount] = await Promise.all([
          query.clone().offset(offset).limit(limit).orderBy('created_at', 'desc'),
          query.clone().count('* as count').first(),
        ]);

        return {
          users,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount.count / limit),
            totalCount: totalCount.count,
            hasNextPage: page < Math.ceil(totalCount.count / limit),
            hasPrevPage: page > 1,
            limit,
            offset,
          },
        };
      },
      { useCache: true, ttl: CACHE.TTL.SHORT }
    );
  }

  async createUser(userData) {
    const result = await db('users').insert(userData).returning('*');
    this.clearCache('user_');
    return result[0];
  }

  async updateUser(id, userData) {
    const result = await db('users')
      .where({ id })
      .update({ ...userData, updated_at: new Date() })
      .returning('*');
    
    this.clearCache(`user_${id}`);
    this.clearCache('user_email_');
    this.clearCache('users_');
    return result[0];
  }

  // Trainer Operations
  async getTrainerById(id, useCache = true) {
    return this.executeQuery(
      `trainer_${id}`,
      async () => {
        const trainer = await db('trainer_profiles')
          .join('users', 'trainer_profiles.user_id', 'users.id')
          .where('trainer_profiles.id', id)
          .where('users.is_active', true)
          .select(
            'trainer_profiles.*',
            'users.email',
            'users.first_name',
            'users.last_name',
            'users.phone_number',
            'users.is_verified',
            'users.created_at',
            'users.updated_at'
          )
          .first();

        if (!trainer) return null;

        // Get specialties
        const specialties = await db('trainer_specialties')
          .join('specialties', 'trainer_specialties.specialty_id', 'specialties.id')
          .where('trainer_specialties.trainer_id', id)
          .select('specialties.name');

        trainer.specialties = specialties.map(s => s.name);

        return trainer;
      },
      { useCache, ttl: CACHE.TTL.MEDIUM }
    );
  }

  async getTrainers(filters = {}, pagination = {}) {
    const { page = 1, limit = 10, specialties, location, priceRange, rating } = filters;
    const offset = (page - 1) * limit;

    return this.executeQuery(
      `trainers_${JSON.stringify(filters)}`,
      async () => {
        let query = db('trainer_profiles')
          .join('users', 'trainer_profiles.user_id', 'users.id')
          .where('users.is_active', true)
          .where('trainer_profiles.is_accepting_clients', true);

        if (specialties && specialties.length > 0) {
          query = query.whereIn('trainer_profiles.id', function() {
            this.select('trainer_id')
              .from('trainer_specialties')
              .join('specialties', 'trainer_specialties.specialty_id', 'specialties.id')
              .whereIn('specialties.name', specialties);
          });
        }

        if (location) {
          query = query.where(function() {
            this.where('trainer_profiles.city', 'like', `%${location}%`)
                .orWhere('trainer_profiles.state', 'like', `%${location}%`);
          });
        }

        if (priceRange) {
          query = query.whereBetween('trainer_profiles.hourly_rate', [
            priceRange.min || 0,
            priceRange.max || 1000
          ]);
        }

        if (rating) {
          query = query.where('trainer_profiles.rating', '>=', rating);
        }

        const [trainers, totalCount] = await Promise.all([
          query.clone()
            .select(
              'trainer_profiles.*',
              'users.email',
              'users.first_name',
              'users.last_name',
              'users.phone_number',
              'users.is_verified'
            )
            .offset(offset)
            .limit(limit)
            .orderBy('trainer_profiles.rating', 'desc'),
          query.clone().count('* as count').first(),
        ]);

        // Get specialties for each trainer
        for (const trainer of trainers) {
          const trainerSpecialties = await db('trainer_specialties')
            .join('specialties', 'trainer_specialties.specialty_id', 'specialties.id')
            .where('trainer_specialties.trainer_id', trainer.id)
            .select('specialties.name');
          
          trainer.specialties = trainerSpecialties.map(s => s.name);
        }

        return {
          trainers,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount.count / limit),
            totalCount: totalCount.count,
            hasNextPage: page < Math.ceil(totalCount.count / limit),
            hasPrevPage: page > 1,
            limit,
            offset,
          },
        };
      },
      { useCache: true, ttl: CACHE.TTL.SHORT }
    );
  }

  async getFeaturedTrainers(limit = 6) {
    return this.executeQuery(
      `featured_trainers_${limit}`,
      async () => {
        const trainers = await db('trainer_profiles')
          .join('users', 'trainer_profiles.user_id', 'users.id')
          .where('users.is_active', true)
          .where('trainer_profiles.is_accepting_clients', true)
          .where('trainer_profiles.is_featured', true)
          .select(
            'trainer_profiles.*',
            'users.email',
            'users.first_name',
            'users.last_name',
            'users.phone_number',
            'users.is_verified'
          )
          .orderBy('trainer_profiles.rating', 'desc')
          .limit(limit);

        // Get specialties for each trainer
        for (const trainer of trainers) {
          const specialties = await db('trainer_specialties')
            .join('specialties', 'trainer_specialties.specialty_id', 'specialties.id')
            .where('trainer_specialties.trainer_id', trainer.id)
            .select('specialties.name');
          
          trainer.specialties = specialties.map(s => s.name);
        }

        return { trainers };
      },
      { useCache: true, ttl: CACHE.TTL.MEDIUM }
    );
  }

  // Booking Operations
  async getBookingsByUserId(userId, filters = {}, pagination = {}) {
    const { page = 1, limit = 10, status, dateFrom, dateTo } = filters;
    const offset = (page - 1) * limit;

    return this.executeQuery(
      `bookings_user_${userId}_${JSON.stringify(filters)}`,
      async () => {
        let query = db('bookings')
          .join('trainer_profiles', 'bookings.trainer_id', 'trainer_profiles.id')
          .join('users as trainer_users', 'trainer_profiles.user_id', 'trainer_users.id')
          .where('bookings.client_id', userId);

        if (status) query = query.where('bookings.status', status);
        if (dateFrom) query = query.where('bookings.scheduled_date', '>=', dateFrom);
        if (dateTo) query = query.where('bookings.scheduled_date', '<=', dateTo);

        const [bookings, totalCount] = await Promise.all([
          query.clone()
            .select(
              'bookings.*',
              'trainer_profiles.business_name',
              'trainer_users.first_name as trainer_first_name',
              'trainer_users.last_name as trainer_last_name'
            )
            .offset(offset)
            .limit(limit)
            .orderBy('bookings.scheduled_date', 'desc'),
          query.clone().count('* as count').first(),
        ]);

        return {
          bookings,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount.count / limit),
            totalCount: totalCount.count,
            hasNextPage: page < Math.ceil(totalCount.count / limit),
            hasPrevPage: page > 1,
            limit,
            offset,
          },
        };
      },
      { useCache: true, ttl: CACHE.TTL.SHORT }
    );
  }

  async createBooking(bookingData) {
    const result = await db('bookings').insert(bookingData).returning('*');
    this.clearCache('bookings_');
    return result[0];
  }

  async updateBooking(id, bookingData) {
    const result = await db('bookings')
      .where({ id })
      .update({ ...bookingData, updated_at: new Date() })
      .returning('*');
    
    this.clearCache('bookings_');
    return result[0];
  }

  // Message Operations
  async getConversationsByUserId(userId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    return this.executeQuery(
      `conversations_user_${userId}_${page}_${limit}`,
      async () => {
        const conversations = await db('conversations')
          .where(function() {
            this.where('client_id', userId).orWhere('trainer_id', userId);
          })
          .orderBy('updated_at', 'desc')
          .offset(offset)
          .limit(limit);

        // Get participant info for each conversation
        for (const conversation of conversations) {
          const participantId = conversation.client_id === userId 
            ? conversation.trainer_id 
            : conversation.client_id;
          
          const participant = await db('users')
            .join('trainer_profiles', 'users.id', 'trainer_profiles.user_id')
            .where('users.id', participantId)
            .select(
              'users.id',
              'users.first_name',
              'users.last_name',
              'users.profile_image_url',
              'trainer_profiles.business_name'
            )
            .first();

          conversation.participant = participant;
        }

        return { conversations };
      },
      { useCache: true, ttl: CACHE.TTL.SHORT }
    );
  }

  async getMessagesByConversationId(conversationId, pagination = {}) {
    const { page = 1, limit = 50 } = pagination;
    const offset = (page - 1) * limit;

    return this.executeQuery(
      `messages_conversation_${conversationId}_${page}_${limit}`,
      () => db('messages')
        .where('conversation_id', conversationId)
        .orderBy('created_at', 'desc')
        .offset(offset)
        .limit(limit),
      { useCache: true, ttl: CACHE.TTL.SHORT }
    );
  }

  async createMessage(messageData) {
    const result = await db('messages').insert(messageData).returning('*');
    this.clearCache(`messages_conversation_${messageData.conversation_id}`);
    this.clearCache('conversations_');
    return result[0];
  }

  // Analytics Operations
  async getDashboardStats() {
    return this.executeQuery(
      'dashboard_stats',
      async () => {
        const [
          userStats,
          trainerStats,
          bookingStats,
          revenueStats
        ] = await Promise.all([
          db('users').count('* as total').first(),
          db('trainer_profiles').count('* as total').first(),
          db('bookings').count('* as total').first(),
          db('payments').sum('amount as total').first(),
        ]);

        return {
          users: {
            total: userStats.total,
            active: await db('users').where('is_active', true).count('* as count').first(),
            verified: await db('users').where('is_verified', true).count('* as count').first(),
          },
          trainers: {
            total: trainerStats.total,
            active: await db('trainer_profiles').where('is_accepting_clients', true).count('* as count').first(),
            featured: await db('trainer_profiles').where('is_featured', true).count('* as count').first(),
          },
          bookings: {
            total: bookingStats.total,
            pending: await db('bookings').where('status', 'pending').count('* as count').first(),
            confirmed: await db('bookings').where('status', 'confirmed').count('* as count').first(),
            completed: await db('bookings').where('status', 'completed').count('* as count').first(),
          },
          revenue: {
            total: revenueStats.total || 0,
            thisMonth: await db('payments')
              .where('created_at', '>=', new Date(new Date().getFullYear(), new Date().getMonth(), 1))
              .sum('amount as total')
              .first(),
          },
        };
      },
      { useCache: true, ttl: CACHE.TTL.MEDIUM }
    );
  }

  // Health check
  async healthCheck() {
    try {
      await db.raw('SELECT 1');
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

export default new DatabaseService();
