import crypto from 'crypto';
import { ApiError } from './errorHandler.js';
import { logger } from '../utils/logger.js';
import db from '../database/connection.js';

// Permission levels hierarchy
const PERMISSION_LEVELS = {
  super_admin: 3,
  admin: 2,
  moderator: 1,
};

// Default permissions for each level
const DEFAULT_PERMISSIONS = {
  super_admin: {
    users: ['create', 'read', 'update', 'delete'],
    admins: ['create', 'read', 'update', 'delete'],
    system: ['read', 'update', 'delete'],
    analytics: ['read'],
    logs: ['read', 'delete'],
  },
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    admins: ['read'],
    system: ['read'],
    analytics: ['read'],
    logs: ['read'],
  },
  moderator: {
    users: ['read', 'update'],
    admins: [],
    system: ['read'],
    analytics: ['read'],
    logs: ['read'],
  },
};

// Middleware to check if user is admin
export const requireAdmin = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    // Check if user has admin role
    if (user.role !== 'admin' && user.admin_level === null) {
      throw new ApiError('Admin access required', 403, 'ADMIN_REQUIRED');
    }

    // Get admin permissions
    const adminPermissions = await db('admin_permissions')
      .where({ user_id: user.id, is_active: true })
      .where('expires_at', '>', new Date())
      .orWhereNull('expires_at')
      .first();

    if (!adminPermissions && !user.admin_level) {
      throw new ApiError(
        'Valid admin permissions required',
        403,
        'INVALID_ADMIN_PERMISSIONS'
      );
    }

    // Attach admin info to request
    req.admin = {
      id: user.id,
      level: user.admin_level || adminPermissions?.permission_level,
      permissions: adminPermissions?.permissions
        ? typeof adminPermissions.permissions === 'string'
          ? JSON.parse(adminPermissions.permissions)
          : adminPermissions.permissions
        : DEFAULT_PERMISSIONS[user.admin_level || 'admin'],
      user: user,
    };

    // Log admin activity
    await logAdminActivity(
      req.admin.id,
      'admin_access',
      'system',
      null,
      {
        endpoint: req.path,
        method: req.method,
      },
      req.ip,
      req.get('User-Agent')
    );

    next();
  } catch (error) {
    logger.error('Admin auth error:', error);
    next(error);
  }
};

// Middleware to check specific permission
export const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const admin = req.admin;

      if (!admin) {
        throw new ApiError(
          'Admin authentication required',
          401,
          'ADMIN_AUTH_REQUIRED'
        );
      }

      const permissions = admin.permissions;
      const hasPermission = permissions[resource]?.includes(action);

      if (!hasPermission) {
        throw new ApiError(
          `Permission denied: ${resource}:${action}`,
          403,
          'PERMISSION_DENIED'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check minimum admin level
export const requireMinLevel = minLevel => {
  return async (req, res, next) => {
    try {
      const admin = req.admin;

      if (!admin) {
        throw new ApiError(
          'Admin authentication required',
          401,
          'ADMIN_AUTH_REQUIRED'
        );
      }

      const userLevel = PERMISSION_LEVELS[admin.level] || 0;
      const requiredLevel = PERMISSION_LEVELS[minLevel] || 0;

      if (userLevel < requiredLevel) {
        throw new ApiError(
          `Minimum admin level required: ${minLevel}`,
          403,
          'INSUFFICIENT_ADMIN_LEVEL'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Function to log admin activities
export const logAdminActivity = async (
  adminId,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
  userAgent
) => {
  try {
    const activityId = crypto.randomUUID();

    await db('admin_activity_log').insert({
      id: activityId,
      admin_id: adminId,
      action,
      target_type: targetType,
      target_id: targetId,
      details: JSON.stringify(details),
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    logger.error('Failed to log admin activity:', error);
  }
};

// Function to check if user can perform action on target
export const canPerformAction = (
  admin,
  resource,
  action,
  targetData = null
) => {
  const permissions = admin.permissions;

  // Check basic permission
  if (!permissions[resource]?.includes(action)) {
    return false;
  }

  // Additional checks for specific resources
  if (resource === 'admins' && targetData) {
    const targetLevel = PERMISSION_LEVELS[targetData.admin_level] || 0;
    const userLevel = PERMISSION_LEVELS[admin.level] || 0;

    // Can't modify admins of equal or higher level
    if (action !== 'read' && targetLevel >= userLevel) {
      return false;
    }
  }

  return true;
};

export default {
  requireAdmin,
  requirePermission,
  requireMinLevel,
  logAdminActivity,
  canPerformAction,
  PERMISSION_LEVELS,
  DEFAULT_PERMISSIONS,
};

// Named exports
export { DEFAULT_PERMISSIONS, PERMISSION_LEVELS };
