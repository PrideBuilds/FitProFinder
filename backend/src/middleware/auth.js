import { verifyAccessToken, extractUserFromToken } from '../utils/auth.js';
import { ApiError } from './errorHandler.js';
import db from '../database/connection.js';

/**
 * Middleware to authenticate user via JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Access token required', 401, 'TOKEN_REQUIRED');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);
    const user = extractUserFromToken(decoded);

    // Check if user still exists in database
    const dbUser = await db('users')
      .where({ id: user.id, is_active: true })
      .first();

    if (!dbUser) {
      throw new ApiError('User not found or inactive', 401, 'USER_NOT_FOUND');
    }

    // Add user to request object
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      role: dbUser.role,
      isVerified: dbUser.is_verified,
      isActive: dbUser.is_active,
      admin_level: dbUser.admin_level,
      admin_since: dbUser.admin_since,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError('Invalid token', 401, 'INVALID_TOKEN'));
    }
  }
};

/**
 * Middleware to authorize user based on roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED')
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          'Insufficient permissions',
          403,
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is verified
 */
export const requireVerification = (req, res, next) => {
  if (!req.user) {
    return next(
      new ApiError('Authentication required', 401, 'AUTHENTICATION_REQUIRED')
    );
  }

  if (!req.user.isVerified) {
    return next(
      new ApiError(
        'Email verification required',
        403,
        'EMAIL_VERIFICATION_REQUIRED'
      )
    );
  }

  next();
};

/**
 * Optional authentication - adds user to request if token is provided
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      const user = extractUserFromToken(decoded);

      // Check if user exists
      const dbUser = await db('users')
        .where({ id: user.id, is_active: true })
        .first();

      if (dbUser) {
        req.user = {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.first_name,
          lastName: dbUser.last_name,
          role: dbUser.role,
          isVerified: dbUser.is_verified,
          isActive: dbUser.is_active,
          admin_level: dbUser.admin_level,
          admin_since: dbUser.admin_since,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};
