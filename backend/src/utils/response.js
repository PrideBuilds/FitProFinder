/**
 * Standardized API Response Utilities
 * Consistent response format for all API endpoints
 */

import { HTTP_STATUS } from '../constants.js';

/**
 * Create a successful response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {Object} meta - Additional metadata
 * @returns {Object} Standardized success response
 */
export const success = (data = null, message = 'Success', meta = {}) => {
  return {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code
 * @param {Object} details - Additional error details
 * @returns {Object} Standardized error response
 */
export const error = (message, code = 'UNKNOWN_ERROR', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = {}) => {
  return {
    success: false,
    message,
    error: {
      code,
      details,
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create a validation error response
 * @param {Object} errors - Validation errors
 * @param {string} message - Error message
 * @returns {Object} Standardized validation error response
 */
export const validationError = (errors, message = 'Validation failed') => {
  return error(message, 'VALIDATION_ERROR', HTTP_STATUS.UNPROCESSABLE_ENTITY, { errors });
};

/**
 * Create a not found error response
 * @param {string} resource - Resource that was not found
 * @returns {Object} Standardized not found error response
 */
export const notFound = (resource = 'Resource') => {
  return error(`${resource} not found`, 'NOT_FOUND', HTTP_STATUS.NOT_FOUND);
};

/**
 * Create an unauthorized error response
 * @param {string} message - Error message
 * @returns {Object} Standardized unauthorized error response
 */
export const unauthorized = (message = 'Unauthorized') => {
  return error(message, 'UNAUTHORIZED', HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Create a forbidden error response
 * @param {string} message - Error message
 * @returns {Object} Standardized forbidden error response
 */
export const forbidden = (message = 'Forbidden') => {
  return error(message, 'FORBIDDEN', HTTP_STATUS.FORBIDDEN);
};

/**
 * Create a conflict error response
 * @param {string} message - Error message
 * @returns {Object} Standardized conflict error response
 */
export const conflict = (message = 'Conflict') => {
  return error(message, 'CONFLICT', HTTP_STATUS.CONFLICT);
};

/**
 * Create a rate limit error response
 * @param {string} message - Error message
 * @returns {Object} Standardized rate limit error response
 */
export const rateLimit = (message = 'Too many requests') => {
  return error(message, 'RATE_LIMIT', HTTP_STATUS.TOO_MANY_REQUESTS);
};

/**
 * Create a paginated response
 * @param {Array} items - Array of items
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 * @returns {Object} Standardized paginated response
 */
export const paginated = (items, pagination, message = 'Success') => {
  return {
    success: true,
    message,
    data: {
      items,
      pagination: {
        currentPage: pagination.currentPage || 1,
        totalPages: pagination.totalPages || 1,
        totalCount: pagination.totalCount || 0,
        hasNextPage: pagination.hasNextPage || false,
        hasPrevPage: pagination.hasPrevPage || false,
        limit: pagination.limit || 10,
        offset: pagination.offset || 0,
      },
    },
    timestamp: new Date().toISOString(),
  };
};

/**
 * Create a created response
 * @param {any} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object} Standardized created response
 */
export const created = (data, message = 'Resource created successfully') => {
  return success(data, message, { statusCode: HTTP_STATUS.CREATED });
};

/**
 * Create a no content response
 * @param {string} message - Success message
 * @returns {Object} Standardized no content response
 */
export const noContent = (message = 'Operation completed successfully') => {
  return success(null, message, { statusCode: HTTP_STATUS.NO_CONTENT });
};

/**
 * Send a standardized response
 * @param {Object} res - Express response object
 * @param {Object} response - Response object
 * @param {number} statusCode - HTTP status code
 */
export const send = (res, response, statusCode = null) => {
  const code = statusCode || response.error?.statusCode || HTTP_STATUS.OK;
  res.status(code).json(response);
};

/**
 * Handle async route errors
 * @param {Function} fn - Async route handler
 * @returns {Function} Wrapped route handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validate required fields
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
export const validateRequired = (data, requiredFields) => {
  const errors = {};
  let isValid = true;

  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors[field] = `${field} is required`;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Sanitize data for response
 * @param {any} data - Data to sanitize
 * @returns {any} Sanitized data
 */
export const sanitize = (data) => {
  if (Array.isArray(data)) {
    return data.map(item => sanitize(item));
  }

  if (data && typeof data === 'object') {
    const sanitized = { ...data };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'passwordHash', 'refreshToken', 'apiKey'];
    sensitiveFields.forEach(field => {
      delete sanitized[field];
    });

    // Recursively sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitize(sanitized[key]);
      }
    });

    return sanitized;
  }

  return data;
};
