import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async password => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with its hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = payload => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'fitprofinder-api',
    audience: 'fitprofinder-app',
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = payload => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'fitprofinder-api',
    audience: 'fitprofinder-app',
  });
};

/**
 * Verify JWT access token
 */
export const verifyAccessToken = token => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'fitprofinder-api',
      audience: 'fitprofinder-app',
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = token => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'fitprofinder-api',
      audience: 'fitprofinder-app',
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate email verification token
 */
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create token response object
 */
export const createTokenResponse = user => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.is_verified,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: JWT_EXPIRES_IN,
  };
};

/**
 * Extract user from token payload
 */
export const extractUserFromToken = tokenPayload => {
  return {
    id: tokenPayload.userId,
    email: tokenPayload.email,
    role: tokenPayload.role,
    isVerified: tokenPayload.isVerified,
  };
};
