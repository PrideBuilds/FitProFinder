/**
 * Validation Utilities
 * Form validation and data validation utilities
 */

import type { ValidationRule, ValidationResult } from '../types/forms';

// Validation rule creators
export const createValidationRule = (
  rule: ValidationRule,
  customMessage?: string
): ValidationRule => ({
  ...rule,
  message: customMessage || rule.message,
});

// Required field validation
export const required = (message = 'This field is required'): ValidationRule => ({
  required: true,
  message,
});

// Length validation
export const minLength = (min: number, message?: string): ValidationRule => ({
  minLength: min,
  message: message || `Must be at least ${min} characters`,
});

export const maxLength = (max: number, message?: string): ValidationRule => ({
  maxLength: max,
  message: message || `Must be no more than ${max} characters`,
});

// Pattern validation
export const pattern = (regex: RegExp, message: string): ValidationRule => ({
  pattern: regex,
  message,
});

// Email validation
export const email = (message = 'Please enter a valid email address'): ValidationRule => ({
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message,
});

// Phone validation
export const phone = (message = 'Please enter a valid phone number'): ValidationRule => ({
  pattern: /^[\+]?[1-9][\d]{0,15}$/,
  message,
});

// URL validation
export const url = (message = 'Please enter a valid URL'): ValidationRule => ({
  pattern: /^https?:\/\/.+/,
  message,
});

// Password validation
export const password = (message = 'Password must be at least 8 characters with uppercase, lowercase, and number'): ValidationRule => ({
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  message,
});

// Number validation
export const min = (min: number, message?: string): ValidationRule => ({
  min: min,
  message: message || `Must be at least ${min}`,
});

export const max = (max: number, message?: string): ValidationRule => ({
  max: max,
  message: message || `Must be no more than ${max}`,
});

// Custom validation
export const custom = (validator: (value: any) => string | null, message?: string): ValidationRule => ({
  custom: validator,
  message,
});

// Validation functions
export const validateField = (
  value: any,
  rules: ValidationRule | ValidationRule[]
): FieldValidationResult => {
  const ruleArray = Array.isArray(rules) ? rules : [rules];
  
  for (const rule of ruleArray) {
    // Required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      return {
        isValid: false,
        error: rule.message || 'This field is required',
      };
    }
    
    // Skip other validations if value is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      continue;
    }
    
    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return {
        isValid: false,
        error: rule.message || `Must be at least ${rule.minLength} characters`,
      };
    }
    
    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return {
        isValid: false,
        error: rule.message || `Must be no more than ${rule.maxLength} characters`,
      };
    }
    
    // Min value validation
    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      return {
        isValid: false,
        error: rule.message || `Must be at least ${rule.min}`,
      };
    }
    
    // Max value validation
    if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
      return {
        isValid: false,
        error: rule.message || `Must be no more than ${rule.max}`,
      };
    }
    
    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return {
        isValid: false,
        error: rule.message || 'Invalid format',
      };
    }
    
    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return {
          isValid: false,
          error: customError,
        };
      }
    }
  }
  
  return { isValid: true };
};

export const validateForm = (
  data: Record<string, any>,
  schema: Record<string, ValidationRule | ValidationRule[]>
): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    const result = validateField(value, rules);
    
    if (!result.isValid) {
      errors[field] = result.error || 'Invalid value';
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

// Common validation schemas
export const commonSchemas = {
  email: {
    email: [required(), email()],
  },
  
  password: {
    password: [required(), password()],
  },
  
  phone: {
    phone: [required(), phone()],
  },
  
  name: {
    firstName: [required(), minLength(2), maxLength(50)],
    lastName: [required(), minLength(2), maxLength(50)],
  },
  
  address: {
    address: [required(), minLength(5), maxLength(100)],
    city: [required(), minLength(2), maxLength(50)],
    state: [required(), minLength(2), maxLength(50)],
    zipCode: [required(), pattern(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code')],
  },
  
  url: {
    url: [required(), url()],
  },
  
  rating: {
    rating: [required(), min(1), max(5)],
  },
  
  price: {
    price: [required(), min(0)],
  },
  
  date: {
    date: [required()],
  },
  
  time: {
    time: [required()],
  },
};

// Form-specific validation schemas
export const formSchemas = {
  login: {
    email: commonSchemas.email.email,
    password: [required()],
  },
  
  register: {
    email: commonSchemas.email.email,
    password: commonSchemas.password.password,
    confirmPassword: [required()],
    firstName: commonSchemas.name.firstName,
    lastName: commonSchemas.name.lastName,
    termsAccepted: [required()],
  },
  
  trainerProfile: {
    firstName: commonSchemas.name.firstName,
    lastName: commonSchemas.name.lastName,
    email: commonSchemas.email.email,
    phoneNumber: commonSchemas.phone.phone,
    businessName: [required(), minLength(2), maxLength(100)],
    bio: [required(), minLength(50), maxLength(1000)],
    experienceYears: [required(), min(0), max(50)],
    hourlyRate: [required(), min(0)],
    ...commonSchemas.address,
  },
  
  booking: {
    trainerId: [required()],
    sessionTypeId: [required()],
    scheduledDate: [required()],
    scheduledTime: [required()],
    notes: [maxLength(500)],
  },
  
  review: {
    rating: commonSchemas.rating.rating,
    comment: [required(), minLength(10), maxLength(1000)],
  },
  
  message: {
    content: [required(), minLength(1), maxLength(2000)],
  },
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  return validateField(email, commonSchemas.email.email).isValid;
};

export const validatePassword = (password: string): boolean => {
  return validateField(password, commonSchemas.password.password).isValid;
};

export const validatePhone = (phone: string): boolean => {
  return validateField(phone, commonSchemas.phone.phone).isValid;
};

export const validateUrl = (url: string): boolean => {
  return validateField(url, commonSchemas.url.url).isValid;
};

// Async validation helpers
export const validateUniqueEmail = async (email: string): Promise<boolean> => {
  try {
    // This would typically make an API call to check if email exists
    // For now, return true (email is unique)
    return true;
  } catch {
    return false;
  }
};

export const validateUniqueUsername = async (username: string): Promise<boolean> => {
  try {
    // This would typically make an API call to check if username exists
    // For now, return true (username is unique)
    return true;
  } catch {
    return false;
  }
};

// File validation
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validateFileType(file, allowedTypes);
};

// Date validation
export const validateDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};

export const validateFutureDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

export const validatePastDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

// Time validation
export const validateTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateTimeRange = (startTime: string, endTime: string): boolean => {
  if (!validateTime(startTime) || !validateTime(endTime)) return false;
  
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  return start < end;
};

// Import types
import type { FieldValidationResult } from '../types/forms';
