/**
 * Deployment Configuration
 * Centralized deployment settings for different environments
 */

export const deploymentConfig = {
  development: {
    name: 'Development',
    description: 'Local development environment',
    api: {
      baseUrl: 'http://localhost:3000/api',
      port: 3000,
      host: 'localhost',
    },
    frontend: {
      baseUrl: 'http://localhost:4321',
      port: 4321,
    },
    database: {
      host: 'localhost',
      port: 5432,
      name: 'fitprofinder_dev',
    },
    features: {
      messaging: true,
      payments: false,
      reviews: true,
      onlineSessions: true,
      notifications: false,
      analytics: false,
    },
    logging: {
      level: 'debug',
      format: 'pretty',
    },
    security: {
      corsOrigin: 'http://localhost:4321',
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 1000,
      },
    },
  },

  staging: {
    name: 'Staging',
    description: 'Staging environment for testing',
    api: {
      baseUrl: 'https://api-staging.fitprofinder.com',
      port: 3000,
      host: '0.0.0.0',
    },
    frontend: {
      baseUrl: 'https://staging.fitprofinder.com',
      port: 4321,
    },
    database: {
      host: 'staging-db.fitprofinder.com',
      port: 5432,
      name: 'fitprofinder_staging',
    },
    features: {
      messaging: true,
      payments: true,
      reviews: true,
      onlineSessions: true,
      notifications: true,
      analytics: true,
    },
    logging: {
      level: 'info',
      format: 'json',
    },
    security: {
      corsOrigin: 'https://staging.fitprofinder.com',
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 500,
      },
    },
  },

  production: {
    name: 'Production',
    description: 'Production environment',
    api: {
      baseUrl: 'https://api.fitprofinder.com',
      port: 3000,
      host: '0.0.0.0',
    },
    frontend: {
      baseUrl: 'https://fitprofinder.com',
      port: 4321,
    },
    database: {
      host: 'prod-db.fitprofinder.com',
      port: 5432,
      name: 'fitprofinder_prod',
    },
    features: {
      messaging: true,
      payments: true,
      reviews: true,
      onlineSessions: true,
      notifications: true,
      analytics: true,
    },
    logging: {
      level: 'warn',
      format: 'json',
    },
    security: {
      corsOrigin: 'https://fitprofinder.com',
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
      },
    },
  },
};

export const getDeploymentConfig = (environment = 'development') => {
  const config = deploymentConfig[environment];
  if (!config) {
    throw new Error(`Unknown environment: ${environment}`);
  }
  return config;
};

export const getEnvironmentVariables = (environment = 'development') => {
  const config = getDeploymentConfig(environment);
  
  return {
    NODE_ENV: environment,
    PUBLIC_API_BASE_URL: config.api.baseUrl,
    API_PORT: config.api.port.toString(),
    API_HOST: config.api.host,
    CORS_ORIGIN: config.security.corsOrigin,
    LOG_LEVEL: config.logging.level,
    LOG_FORMAT: config.logging.format,
    ENABLE_MESSAGING: config.features.messaging.toString(),
    ENABLE_PAYMENTS: config.features.payments.toString(),
    ENABLE_REVIEWS: config.features.reviews.toString(),
    ENABLE_ONLINE_SESSIONS: config.features.onlineSessions.toString(),
    ENABLE_NOTIFICATIONS: config.features.notifications.toString(),
    ENABLE_ANALYTICS: config.features.analytics.toString(),
    RATE_LIMIT_MAX_REQUESTS: config.security.rateLimit.maxRequests.toString(),
  };
};

export default deploymentConfig;
