/**
 * Environment configuration with validation
 * Centralized environment variable management with Zod validation
 */

import { z } from 'zod';

// Define the environment schema
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // CometChat
  NEXT_PUBLIC_COMETCHAT_APP_ID: z.string().optional(),
  NEXT_PUBLIC_COMETCHAT_REGION: z.string().optional(),
  NEXT_PUBLIC_COMETCHAT_AUTH_KEY: z.string().optional(),

  // Stripe
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Telemetry
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  SYSTEM_FROM_EMAIL: z.string().email().optional(),

  // Feature Flags
  ENABLE_BETA_GATE: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  INVITE_CODE_REQUIRED: z
    .string()
    .transform(val => val === 'true')
    .optional(),

  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('localhost'),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // Security
  JWT_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),

  // External Services
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Development
  DEBUG: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  MOCK_PAYMENTS: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
  MOCK_EMAILS: z
    .string()
    .transform(val => val === 'true')
    .default('false'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
};

// Export validated environment variables
export const env = parseEnv();

// Type-safe environment access
export type Env = z.infer<typeof envSchema>;

// Helper functions for common environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

export const isBetaGateEnabled = env.ENABLE_BETA_GATE ?? false;
export const isInviteCodeRequired = env.INVITE_CODE_REQUIRED ?? false;

// Feature flags helper
export const getFeatureFlag = (
  flag: keyof Pick<Env, 'ENABLE_BETA_GATE' | 'INVITE_CODE_REQUIRED'>
) => {
  return env[flag] ?? false;
};

// Environment validation on startup
if (isProduction) {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'JWT_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}
