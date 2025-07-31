import db from '../database/connection.js';
import { ApiError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcrypt';
import { logAdminActivity, DEFAULT_PERMISSIONS } from '../middleware/adminAuth.js';

class AdminService {
  // Dashboard Analytics
  async getDashboardStats() {
    try {
      const [
        userStats,
        trainerStats,
        conversationStats,
        messageStats,
        recentUsers,
        recentActivity
      ] = await Promise.all([
        this.getUserStats(),
        this.getTrainerStats(),
        this.getConversationStats(),
        this.getMessageStats(),
        this.getRecentUsers(10),
        this.getRecentActivity(20)
      ]);

      return {
        overview: {
          totalUsers: userStats.total,
          activeUsers: userStats.active,
          totalTrainers: trainerStats.total,
          activeTrainers: trainerStats.active,
          totalConversations: conversationStats.total,
          activeConversations: conversationStats.active,
          totalMessages: messageStats.total,
          messagesLast24h: messageStats.last24h
        },
        userGrowth: await this.getUserGrowthStats(),
        recentUsers,
        recentActivity,
        systemHealth: await this.getSystemHealth()
      };
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw new ApiError('Failed to retrieve dashboard statistics', 500);
    }
  }

  async getUserStats() {
    const [total, active, byRole] = await Promise.all([
      db('users').count('* as count').first(),
      db('users').where('is_active', true).count('* as count').first(),
      db('users').select('role').count('* as count').groupBy('role')
    ]);

    return {
      total: total.count,
      active: active.count,
      byRole: byRole.reduce((acc, item) => {
        acc[item.role] = item.count;
        return acc;
      }, {})
    };
  }

  async getTrainerStats() {
    const [total, active] = await Promise.all([
      db('users').where('role', 'trainer').count('* as count').first(),
      db('users').where({ role: 'trainer', is_active: true }).count('* as count').first()
    ]);

    return {
      total: total.count,
      active: active.count
    };
  }

  async getConversationStats() {
    const [total, active] = await Promise.all([
      db('conversations').count('* as count').first(),
      db('conversations').where('status', 'active').count('* as count').first()
    ]);

    return {
      total: total.count,
      active: active.count
    };
  }

  async getMessageStats() {
    const [total, last24h] = await Promise.all([
      db('messages').count('* as count').first(),
      db('messages')
        .where('created_at', '>', db.raw("datetime('now', '-1 day')"))
        .count('* as count')
        .first()
    ]);

    return {
      total: total.count,
      last24h: last24h.count
    };
  }

  async getUserGrowthStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const growth = await db('users')
      .select(db.raw("DATE(created_at) as date"))
      .count('* as count')
      .where('created_at', '>', thirtyDaysAgo)
      .groupBy(db.raw("DATE(created_at)"))
      .orderBy('date');

    return growth;
  }

  async getRecentUsers(limit = 10) {
    return await db('users')
      .select('id', 'first_name', 'last_name', 'email', 'role', 'created_at', 'is_active')
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  async getRecentActivity(limit = 20) {
    return await db('admin_activity_log')
      .select('admin_activity_log.*', 'users.first_name', 'users.last_name')
      .leftJoin('users', 'admin_activity_log.admin_id', 'users.id')
      .orderBy('admin_activity_log.created_at', 'desc')
      .limit(limit);
  }

  async getSystemHealth() {
    try {
      const [dbHealth, recentErrors] = await Promise.all([
        this.checkDatabaseHealth(),
        this.getRecentErrors()
      ]);

      return {
        database: dbHealth,
        errors: recentErrors,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date()
      };
    } catch (error) {
      return {
        database: { status: 'error', message: error.message },
        errors: [],
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date()
      };
    }
  }

  async checkDatabaseHealth() {
    try {
      await db.raw('SELECT 1');
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async getRecentErrors() {
    // This would typically come from a logging system
    // For now, return empty array
    return [];
  }

  // User Management
  async getUsers(page = 1, limit = 50, filters = {}) {
    let query = db('users').select(
      'id', 'email', 'first_name', 'last_name', 'role', 
      'is_active', 'is_verified', 'created_at', 'last_login_at',
      'admin_level', 'admin_since'
    );

    // Apply filters
    if (filters.role) {
      query = query.where('role', filters.role);
    }
    if (filters.isActive !== undefined) {
      query = query.where('is_active', filters.isActive);
    }
    if (filters.search) {
      query = query.where(function() {
        this.where('email', 'like', `%${filters.search}%`)
          .orWhere('first_name', 'like', `%${filters.search}%`)
          .orWhere('last_name', 'like', `%${filters.search}%`);
      });
    }

    const offset = (page - 1) * limit;
    const [users, totalCount] = await Promise.all([
      query.orderBy('created_at', 'desc').limit(limit).offset(offset),
      db('users').count('* as count').first()
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    };
  }

  async getUserById(userId) {
    const user = await db('users')
      .where('id', userId)
      .first();

    if (!user) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Get admin permissions if user is admin
    let adminPermissions = null;
    if (user.role === 'admin') {
      adminPermissions = await db('admin_permissions')
        .where({ user_id: userId, is_active: true })
        .first();
    }

    return {
      ...user,
      adminPermissions
    };
  }

  async createUser(adminId, userData) {
    try {
      const userId = crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const newUser = {
        id: userId,
        email: userData.email,
        password_hash: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role || 'client',
        phone_number: userData.phoneNumber,
        is_verified: userData.isVerified || false,
        is_active: true
      };

      await db('users').insert(newUser);

      // Log activity
      await logAdminActivity(adminId, 'user_created', 'user', userId, {
        email: userData.email,
        role: userData.role
      });

      return await this.getUserById(userId);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505') {
        throw new ApiError('Email already exists', 400, 'EMAIL_EXISTS');
      }
      throw error;
    }
  }

  async updateUser(adminId, userId, updateData) {
    const user = await this.getUserById(userId);

    const updates = {};
    if (updateData.firstName) updates.first_name = updateData.firstName;
    if (updateData.lastName) updates.last_name = updateData.lastName;
    if (updateData.email) updates.email = updateData.email;
    if (updateData.phoneNumber) updates.phone_number = updateData.phoneNumber;
    if (updateData.isActive !== undefined) updates.is_active = updateData.isActive;
    if (updateData.isVerified !== undefined) updates.is_verified = updateData.isVerified;
    if (updateData.role) updates.role = updateData.role;

    if (Object.keys(updates).length === 0) {
      throw new ApiError('No valid updates provided', 400);
    }

    await db('users').where('id', userId).update(updates);

    // Log activity
    await logAdminActivity(adminId, 'user_updated', 'user', userId, {
      updates,
      previousData: { email: user.email, role: user.role }
    });

    return await this.getUserById(userId);
  }

  async deleteUser(adminId, userId) {
    const user = await this.getUserById(userId);

    await db('users').where('id', userId).del();

    // Log activity
    await logAdminActivity(adminId, 'user_deleted', 'user', userId, {
      email: user.email,
      role: user.role
    });

    return { message: 'User deleted successfully' };
  }

  // Admin Management
  async getAdmins() {
    return await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'admin_level', 'admin_since', 'created_at', 'last_login_at')
      .where('role', 'admin')
      .orWhereNotNull('admin_level')
      .orderBy('admin_since', 'desc');
  }

  async promoteToAdmin(adminId, userId, level = 'moderator') {
    const user = await this.getUserById(userId);

    if (user.role === 'admin' && user.admin_level) {
      throw new ApiError('User is already an admin', 400, 'ALREADY_ADMIN');
    }

    const updates = {
      role: 'admin',
      admin_level: level,
      admin_since: new Date()
    };

    await db('users').where('id', userId).update(updates);

    // Create admin permissions record
    const permissionId = crypto.randomUUID();
    await db('admin_permissions').insert({
      id: permissionId,
      user_id: userId,
      permission_level: level,
      permissions: JSON.stringify(DEFAULT_PERMISSIONS[level]),
      granted_by: adminId,
      is_active: true
    });

    // Log activity
    await logAdminActivity(adminId, 'admin_promoted', 'admin', userId, {
      level,
      email: user.email
    });

    return await this.getUserById(userId);
  }

  async updateAdminLevel(adminId, userId, newLevel) {
    const user = await this.getUserById(userId);

    if (user.role !== 'admin') {
      throw new ApiError('User is not an admin', 400, 'NOT_ADMIN');
    }

    await db('users').where('id', userId).update({ admin_level: newLevel });

    // Update permissions
    await db('admin_permissions')
      .where({ user_id: userId, is_active: true })
      .update({
        permission_level: newLevel,
        permissions: JSON.stringify(DEFAULT_PERMISSIONS[newLevel])
      });

    // Log activity
    await logAdminActivity(adminId, 'admin_level_updated', 'admin', userId, {
      newLevel,
      previousLevel: user.admin_level,
      email: user.email
    });

    return await this.getUserById(userId);
  }

  async revokeAdmin(adminId, userId) {
    const user = await this.getUserById(userId);

    if (user.role !== 'admin') {
      throw new ApiError('User is not an admin', 400, 'NOT_ADMIN');
    }

    await db('users').where('id', userId).update({
      role: 'client',
      admin_level: null,
      admin_since: null
    });

    // Deactivate admin permissions
    await db('admin_permissions')
      .where({ user_id: userId })
      .update({ is_active: false });

    // Log activity
    await logAdminActivity(adminId, 'admin_revoked', 'admin', userId, {
      email: user.email,
      previousLevel: user.admin_level
    });

    return await this.getUserById(userId);
  }

  // Activity Logs
  async getActivityLogs(page = 1, limit = 50, filters = {}) {
    let query = db('admin_activity_log')
      .select('admin_activity_log.*', 'users.first_name', 'users.last_name', 'users.email')
      .leftJoin('users', 'admin_activity_log.admin_id', 'users.id');

    if (filters.adminId) {
      query = query.where('admin_activity_log.admin_id', filters.adminId);
    }
    if (filters.action) {
      query = query.where('admin_activity_log.action', filters.action);
    }
    if (filters.targetType) {
      query = query.where('admin_activity_log.target_type', filters.targetType);
    }
    if (filters.dateFrom) {
      query = query.where('admin_activity_log.created_at', '>=', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.where('admin_activity_log.created_at', '<=', filters.dateTo);
    }

    const offset = (page - 1) * limit;
    const [logs, totalCount] = await Promise.all([
      query.orderBy('admin_activity_log.created_at', 'desc').limit(limit).offset(offset),
      db('admin_activity_log').count('* as count').first()
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      })),
      pagination: {
        page,
        limit,
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / limit)
      }
    };
  }
}

export default new AdminService(); 