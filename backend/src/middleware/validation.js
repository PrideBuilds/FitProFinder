import ApiError from '../utils/ApiError.js';

// Middleware to validate required fields in request body
export const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return next(new ApiError(
        `Missing required fields: ${missingFields.join(', ')}`,
        'VALIDATION_ERROR',
        400
      ));
    }
    
    next();
  };
};

// Middleware to validate email format
export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError('Invalid email format', 'INVALID_EMAIL', 400));
    }
  }
  
  next();
};

// Middleware to validate password strength
export const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (password) {
    if (password.length < 8) {
      return next(new ApiError('Password must be at least 8 characters long', 'WEAK_PASSWORD', 400));
    }
    
    // Check for at least one number, one letter
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    if (!hasNumber || !hasLetter) {
      return next(new ApiError('Password must contain at least one letter and one number', 'WEAK_PASSWORD', 400));
    }
  }
  
  next();
};

// Middleware to validate date format
export const validateDate = (dateField) => {
  return (req, res, next) => {
    const dateValue = req.body[dateField] || req.query[dateField];
    
    if (dateValue) {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return next(new ApiError(`Invalid date format for ${dateField}`, 'INVALID_DATE', 400));
      }
    }
    
    next();
  };
};

// Middleware to validate UUID format
export const validateUUID = (uuidField) => {
  return (req, res, next) => {
    const uuidValue = req.params[uuidField] || req.body[uuidField];
    
    if (uuidValue) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(uuidValue)) {
        return next(new ApiError(`Invalid UUID format for ${uuidField}`, 'INVALID_UUID', 400));
      }
    }
    
    next();
  };
};

// Middleware to sanitize input
export const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
        // Remove script tags and other dangerous HTML
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        obj[key] = obj[key].replace(/javascript:/gi, '');
        obj[key] = obj[key].replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
}; 