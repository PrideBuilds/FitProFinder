/**
 * Backend Constants
 * Centralized constants for the backend application
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
};

// User Roles
export const USER_ROLES = {
  CLIENT: 'client',
  TRAINER: 'trainer',
  ADMIN: 'admin',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
};

// Message Status
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

// Conversation Status
export const CONVERSATION_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  BLOCKED: 'blocked',
};

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// Rate Limiting
export const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // per window
  LOGIN_MAX_REQUESTS: 5, // per window
  REGISTER_MAX_REQUESTS: 3, // per window
  PASSWORD_RESET_MAX_REQUESTS: 3, // per window
};

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '15m',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  UPLOAD_DIR: 'uploads',
};

// Database
export const DATABASE = {
  CONNECTION_TIMEOUT: 30000,
  QUERY_TIMEOUT: 10000,
  MAX_CONNECTIONS: 10,
  MIN_CONNECTIONS: 2,
};

// Cache
export const CACHE = {
  TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 60 * 60 * 1000, // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  KEYS: {
    USER: 'user',
    TRAINERS: 'trainers',
    BOOKINGS: 'bookings',
    CONVERSATIONS: 'conversations',
    MESSAGES: 'messages',
  },
};

// Email
export const EMAIL = {
  FROM: 'noreply@fitprofinder.com',
  SUPPORT: 'support@fitprofinder.com',
  TEMPLATES: {
    WELCOME: 'welcome',
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'password_reset',
    BOOKING_CONFIRMATION: 'booking_confirmation',
    BOOKING_REMINDER: 'booking_reminder',
    BOOKING_CANCELLATION: 'booking_cancellation',
  },
};

// Stripe
export const STRIPE = {
  CURRENCY: 'usd',
  COUNTRY: 'US',
  PAYMENT_METHODS: ['card'],
  CAPTURE_METHOD: 'automatic',
};

// CometChat
export const COMETCHAT = {
  API_VERSION: 'v3.0',
  REGIONS: {
    US: 'us',
    EU: 'eu',
    AP: 'ap',
  },
};

// Admin
export const ADMIN = {
  LEVELS: {
    SUPER_ADMIN: 100,
    ADMIN: 50,
    MODERATOR: 25,
  },
  PERMISSIONS: {
    MANAGE_USERS: 'manage_users',
    MANAGE_TRAINERS: 'manage_trainers',
    MANAGE_BOOKINGS: 'manage_bookings',
    MANAGE_PAYMENTS: 'manage_payments',
    MANAGE_MESSAGES: 'manage_messages',
    VIEW_ANALYTICS: 'view_analytics',
    MANAGE_SETTINGS: 'manage_settings',
  },
};

// Logging
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
};

// Environment
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
};

// API Versioning
export const API_VERSION = 'v1';

// CORS
export const CORS_OPTIONS = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://fitprofinder.com', 'https://www.fitprofinder.com']
    : ['http://localhost:4321', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security
export const SECURITY = {
  BCRYPT_ROUNDS: 12,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',
  COOKIE_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
};

// Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  URL_REGEX: /^https?:\/\/.+/,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  ZIP_CODE_REGEX: /^\d{5}(-\d{4})?$/,
  TIME_REGEX: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
};

// Timeouts
export const TIMEOUTS = {
  DATABASE: 10000,
  API: 30000,
  FILE_UPLOAD: 300000, // 5 minutes
  EMAIL: 10000,
  PAYMENT: 30000,
};

// Retry Configuration
export const RETRY = {
  MAX_ATTEMPTS: 3,
  DELAY: 1000,
  BACKOFF_FACTOR: 2,
};

// Monitoring
export const MONITORING = {
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  METRICS_COLLECTION_INTERVAL: 60000, // 1 minute
  ERROR_THRESHOLD: 10, // errors per minute
  RESPONSE_TIME_THRESHOLD: 5000, // 5 seconds
};
