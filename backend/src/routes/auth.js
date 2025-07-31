import express from 'express';
import { body, validationResult } from 'express-validator';
import { randomUUID } from 'crypto';
import { hashPassword, comparePassword, createTokenResponse, generateVerificationToken } from '../utils/auth.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import db from '../database/connection.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('role').optional().isIn(['client', 'trainer']).withMessage('Role must be client or trainer')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email, password, firstName, lastName, role = 'client', phoneNumber } = req.body;

  // Check if user already exists
  const existingUser = await db('users').where({ email }).first();
  if (existingUser) {
    throw new ApiError('User already exists with this email', 409, 'USER_EXISTS');
  }

  // Hash password
  const passwordHash = await hashPassword(password);
  const verificationToken = generateVerificationToken();

  // Create user
  const [user] = await db('users').insert({
    id: randomUUID(),
    email,
    password_hash: passwordHash,
    first_name: firstName,
    last_name: lastName,
    role,
    phone_number: phoneNumber,
    email_verification_token: verificationToken
  }).returning('*');

  // Generate tokens
  const tokens = createTokenResponse(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
        phoneNumber: user.phone_number
      },
      tokens
    }
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { email, password } = req.body;

  // Find user
  const user = await db('users').where({ email, is_active: true }).first();
  if (!user) {
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login
  await db('users').where({ id: user.id }).update({
    last_login_at: new Date(),
    last_login_ip: req.ip
  });

  // Generate tokens
  const tokens = createTokenResponse(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
        phoneNumber: user.phone_number
      },
      tokens
    }
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await db('users').where({ id: req.user.id }).first();
  
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }

  const userResponse = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    isVerified: user.is_verified,
    phoneNumber: user.phone_number,
    profileImageUrl: user.profile_image_url,
    createdAt: user.created_at
  };

  // Include admin-specific fields if user is an admin
  if (user.role === 'admin') {
    userResponse.adminLevel = user.admin_level;
    userResponse.adminSince = user.admin_since;
    userResponse.lastLoginAt = user.last_login_at;
  }

  res.json({
    success: true,
    data: {
      user: userResponse
    }
  });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // In a real app, you might want to blacklist the token
  // For now, we'll just return success and let client handle token removal
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email
 * @access  Public
 */
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR');
  }

  const { token } = req.body;

  // Find user with verification token
  const user = await db('users').where({ email_verification_token: token }).first();
  if (!user) {
    throw new ApiError('Invalid verification token', 400, 'INVALID_TOKEN');
  }

  // Update user as verified
  await db('users').where({ id: user.id }).update({
    is_verified: true,
    email_verified_at: new Date(),
    email_verification_token: null
  });

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

export default router; 