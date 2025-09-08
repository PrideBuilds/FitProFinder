/**
 * Configuration Management
 * Centralized configuration with environment validation
 */

import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  
  // API Configuration
  PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:3000/api'),
  API_PORT: z.string().transform(Number).default('3000'),
  API_HOST: z.string().default('localhost'),
  
  // Database Configuration
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().transform(Number).default('5432'),
  DB_NAME: z.string().default('fitprofinder'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_SSL: z.string().transform(val => val === 'true').default('false'),
  
  // Supabase Configuration
  PUBLIC_SUPABASE_URL: z.string().url().optional(),
  PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // CometChat Configuration
  PUBLIC_COMETCHAT_APP_ID: z.string().optional(),
  PUBLIC_COMETCHAT_REGION: z.string().default('us'),
  PUBLIC_COMETCHAT_AUTH_KEY: z.string().optional(),
  
  // Stripe Configuration
  PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32).default('your-super-secret-jwt-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  // File Upload Configuration
  UPLOAD_MAX_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().default('image/jpeg,image/png,image/gif,image/webp'),
  UPLOAD_DIR: z.string().default('uploads'),
  
  // Redis Configuration (for caching)
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('pretty'),
  
  // Feature Flags
  ENABLE_MESSAGING: z.string().transform(val => val === 'true').default('true'),
  ENABLE_PAYMENTS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_REVIEWS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_ONLINE_SESSIONS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_NOTIFICATIONS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  ENABLE_DARK_MODE: z.string().transform(val => val === 'true').default('true'),
  ENABLE_MULTI_LANGUAGE: z.string().transform(val => val === 'true').default('false'),
  
  // Security
  CORS_ORIGIN: z.string().default('http://localhost:4321'),
  SESSION_SECRET: z.string().min(32).default('your-super-secret-session-key-change-in-production'),
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  
  // Monitoring
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('false'),
  METRICS_PORT: z.string().transform(Number).default('9090'),
  
  // Development
  ENABLE_DEBUG: z.string().transform(val => val === 'true').default('false'),
  ENABLE_SWAGGER: z.string().transform(val => val === 'true').default('false'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Get validated environment variables
const env = parseEnv();

// Configuration object
export const config = {
  // Environment
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // API
  api: {
    baseUrl: env.PUBLIC_API_BASE_URL,
    port: env.API_PORT,
    host: env.API_HOST,
    corsOrigin: env.CORS_ORIGIN,
  },
  
  // Database
  database: {
    url: env.DATABASE_URL,
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    ssl: env.DB_SSL,
  },
  
  // Supabase
  supabase: {
    url: env.PUBLIC_SUPABASE_URL,
    anonKey: env.PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // CometChat
  cometchat: {
    appId: env.PUBLIC_COMETCHAT_APP_ID,
    region: env.PUBLIC_COMETCHAT_REGION,
    authKey: env.PUBLIC_COMETCHAT_AUTH_KEY,
  },
  
  // Stripe
  stripe: {
    publishableKey: env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },
  
  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  // Email
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.SMTP_FROM,
  },
  
  // File Upload
  upload: {
    maxSize: env.UPLOAD_MAX_SIZE,
    allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(','),
    directory: env.UPLOAD_DIR,
  },
  
  // Redis
  redis: {
    url: env.REDIS_URL,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  // Logging
  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },
  
  // Feature Flags
  features: {
    messaging: env.ENABLE_MESSAGING,
    payments: env.ENABLE_PAYMENTS,
    reviews: env.ENABLE_REVIEWS,
    onlineSessions: env.ENABLE_ONLINE_SESSIONS,
    notifications: env.ENABLE_NOTIFICATIONS,
    analytics: env.ENABLE_ANALYTICS,
    darkMode: env.ENABLE_DARK_MODE,
    multiLanguage: env.ENABLE_MULTI_LANGUAGE,
  },
  
  // Security
  security: {
    sessionSecret: env.SESSION_SECRET,
    bcryptRounds: env.BCRYPT_ROUNDS,
  },
  
  // Monitoring
  monitoring: {
    enabled: env.ENABLE_METRICS,
    port: env.METRICS_PORT,
  },
  
  // Development
  development: {
    debug: env.ENABLE_DEBUG,
    swagger: env.ENABLE_SWAGGER,
  },
};

// Validation helpers
export const validateConfig = () => {
  const errors: string[] = [];
  
  // Required for production
  if (config.isProduction) {
    if (!config.supabase.url) errors.push('PUBLIC_SUPABASE_URL is required in production');
    if (!config.supabase.anonKey) errors.push('PUBLIC_SUPABASE_ANON_KEY is required in production');
    if (!config.cometchat.appId) errors.push('PUBLIC_COMETCHAT_APP_ID is required in production');
    if (!config.stripe.secretKey) errors.push('STRIPE_SECRET_KEY is required in production');
    if (config.jwt.secret === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be changed in production');
    }
    if (config.security.sessionSecret === 'your-super-secret-session-key-change-in-production') {
      errors.push('SESSION_SECRET must be changed in production');
    }
  }
  
  // Required for messaging
  if (config.features.messaging && !config.cometchat.appId) {
    errors.push('PUBLIC_COMETCHAT_APP_ID is required when messaging is enabled');
  }
  
  // Required for payments
  if (config.features.payments && !config.stripe.secretKey) {
    errors.push('STRIPE_SECRET_KEY is required when payments are enabled');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }
  
  return true;
};

// Export default config
export default config;
