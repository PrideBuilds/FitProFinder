/**
 * Application Constants
 * Centralized constants used throughout the application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// CometChat Configuration
export const COMETCHAT_CONFIG = {
  APP_ID: import.meta.env.PUBLIC_COMETCHAT_APP_ID || 'YOUR_APP_ID',
  REGION: import.meta.env.PUBLIC_COMETCHAT_REGION || 'us',
  AUTH_KEY: import.meta.env.PUBLIC_COMETCHAT_AUTH_KEY || 'YOUR_AUTH_KEY',
} as const;

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: import.meta.env.PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  ANON_KEY: import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY',
} as const;

// Stripe Configuration
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY || 'YOUR_STRIPE_KEY',
  CURRENCY: 'usd',
  COUNTRY: 'US',
} as const;

// Application Settings
export const APP_CONFIG = {
  NAME: 'FitProFinder',
  VERSION: '1.0.0',
  DESCRIPTION: 'Find and connect with certified fitness professionals',
  SUPPORT_EMAIL: 'support@fitprofinder.com',
  CONTACT_PHONE: '+1 (555) 123-4567',
  ADDRESS: {
    street: '123 Fitness Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'US',
  },
} as const;

// User Roles
export const USER_ROLES = {
  CLIENT: 'client',
  TRAINER: 'trainer',
  ADMIN: 'admin',
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
} as const;

// Message Status
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

// Conversation Status
export const CONVERSATION_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  BLOCKED: 'blocked',
} as const;

// Session Types
export const SESSION_TYPES = {
  PERSONAL_TRAINING: 'personal_training',
  GROUP_FITNESS: 'group_fitness',
  YOGA: 'yoga',
  PILATES: 'pilates',
  CARDIO: 'cardio',
  STRENGTH_TRAINING: 'strength_training',
  NUTRITION_COACHING: 'nutrition_coaching',
  ONLINE: 'online',
  IN_PERSON: 'in_person',
} as const;

// Specialties
export const SPECIALTIES = {
  WEIGHT_LOSS: 'Weight Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  CARDIO_FITNESS: 'Cardio Fitness',
  STRENGTH_TRAINING: 'Strength Training',
  YOGA: 'Yoga',
  PILATES: 'Pilates',
  NUTRITION: 'Nutrition',
  REHABILITATION: 'Rehabilitation',
  SPORTS_SPECIFIC: 'Sports Specific',
  SENIOR_FITNESS: 'Senior Fitness',
  PRE_POST_NATAL: 'Pre/Post Natal',
  FUNCTIONAL_FITNESS: 'Functional Fitness',
} as const;

// Price Ranges
export const PRICE_RANGES = {
  UNDER_50: { min: 0, max: 50, label: 'Under $50' },
  FIFTY_TO_100: { min: 50, max: 100, label: '$50 - $100' },
  HUNDRED_TO_150: { min: 100, max: 150, label: '$100 - $150' },
  HUNDRED_FIFTY_TO_200: { min: 150, max: 200, label: '$150 - $200' },
  OVER_200: { min: 200, max: 1000, label: 'Over $200' },
} as const;

// Experience Levels
export const EXPERIENCE_LEVELS = {
  BEGINNER: { min: 0, max: 2, label: '0-2 years' },
  INTERMEDIATE: { min: 2, max: 5, label: '2-5 years' },
  EXPERIENCED: { min: 5, max: 10, label: '5-10 years' },
  EXPERT: { min: 10, max: 50, label: '10+ years' },
} as const;

// Rating Levels
export const RATING_LEVELS = {
  EXCELLENT: { min: 4.5, max: 5, label: 'Excellent' },
  GOOD: { min: 3.5, max: 4.5, label: 'Good' },
  AVERAGE: { min: 2.5, max: 3.5, label: 'Average' },
  POOR: { min: 1, max: 2.5, label: 'Poor' },
} as const;

// Time Zones
export const TIME_ZONES = {
  EST: 'America/New_York',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  PST: 'America/Los_Angeles',
  UTC: 'UTC',
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  MEDIUM: 'MMMM d, yyyy',
  LONG: 'EEEE, MMMM d, yyyy',
  FULL: 'EEEE, MMMM d, yyyy h:mm a',
} as const;

// Time Formats
export const TIME_FORMATS = {
  TWELVE_HOUR: 'h:mm a',
  TWENTY_FOUR_HOUR: 'HH:mm',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

// Search
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_MS: 300,
  MAX_RESULTS: 100,
} as const;

// Notifications
export const NOTIFICATIONS = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 10000,
  },
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
} as const;

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
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'preferences',
  CART: 'cart',
  RECENT_SEARCHES: 'recent_searches',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    DELETE: '/users/delete',
  },
  TRAINERS: {
    LIST: '/trainers',
    SEARCH: '/trainers/search',
    FEATURED: '/trainers/featured',
    DETAILS: '/trainers/:id',
    SPECIALTIES: '/trainers/specialties',
  },
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    UPDATE: '/bookings/:id',
    CANCEL: '/bookings/:id/cancel',
    CONFIRM: '/bookings/:id/confirm',
  },
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    MESSAGES: '/messages/conversations/:id/messages',
    SEND: '/messages/send',
    MARK_READ: '/messages/mark-read',
  },
  PAYMENTS: {
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    REFUND: '/payments/refund',
  },
  ADMIN: {
    USERS: '/admin/users',
    STATS: '/admin/stats',
    SETTINGS: '/admin/settings',
  },
} as const;

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
} as const;

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
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_MESSAGING: 'enable_messaging',
  ENABLE_PAYMENTS: 'enable_payments',
  ENABLE_REVIEWS: 'enable_reviews',
  ENABLE_ONLINE_SESSIONS: 'enable_online_sessions',
  ENABLE_NOTIFICATIONS: 'enable_notifications',
  ENABLE_ANALYTICS: 'enable_analytics',
  ENABLE_DARK_MODE: 'enable_dark_mode',
  ENABLE_MULTI_LANGUAGE: 'enable_multi_language',
} as const;

// Environment
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

// Log Levels
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const;

// Component Sizes
export const COMPONENT_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const;

// Component Variants
export const COMPONENT_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
} as const;

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints
export const BREAKPOINTS = {
  XS: 0,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;
