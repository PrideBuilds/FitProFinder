import { logger } from '../utils/logger.js';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error ${err.message}`, {
    error: err,
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ApiError(message, 404, 'RESOURCE_NOT_FOUND');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ApiError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ApiError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ApiError(message, 401, 'TOKEN_EXPIRED');
  }

  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    const message = 'Resource already exists';
    error = new ApiError(message, 409, 'RESOURCE_EXISTS');
  }

  if (err.code === '23503') { // Foreign key violation
    const message = 'Referenced resource not found';
    error = new ApiError(message, 400, 'INVALID_REFERENCE');
  }

  if (err.code === '23502') { // Not null violation
    const message = 'Required field missing';
    error = new ApiError(message, 400, 'REQUIRED_FIELD_MISSING');
  }

  // Validation errors from express-validator
  if (err.type === 'validation') {
    const message = err.errors?.map(e => e.msg).join(', ') || 'Validation failed';
    error = new ApiError(message, 400, 'VALIDATION_ERROR');
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Handle async errors in route handlers
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Handle 404 errors
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
}; 