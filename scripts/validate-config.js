#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates environment configuration before deployment
 */

import { config, validateConfig } from '../src/lib/config.js';
import { logger } from '../backend/src/utils/logger.js';

const main = async () => {
  console.log('🔍 Validating configuration...\n');

  try {
    // Validate configuration
    validateConfig();
    console.log('✅ Configuration validation passed!\n');

    // Display configuration summary
    console.log('📋 Configuration Summary:');
    console.log('========================');
    console.log(`Environment: ${config.env}`);
    console.log(`API URL: ${config.api.baseUrl}`);
    console.log(`Database: ${config.database.host}:${config.database.port}/${config.database.name}`);
    console.log(`Features:`);
    console.log(`  - Messaging: ${config.features.messaging ? '✅' : '❌'}`);
    console.log(`  - Payments: ${config.features.payments ? '✅' : '❌'}`);
    console.log(`  - Reviews: ${config.features.reviews ? '✅' : '❌'}`);
    console.log(`  - Online Sessions: ${config.features.onlineSessions ? '✅' : '❌'}`);
    console.log(`  - Notifications: ${config.features.notifications ? '✅' : '❌'}`);
    console.log(`  - Analytics: ${config.features.analytics ? '✅' : '❌'}`);
    console.log(`  - Dark Mode: ${config.features.darkMode ? '✅' : '❌'}`);
    console.log(`  - Multi Language: ${config.features.multiLanguage ? '✅' : '❌'}`);

    // Check for production readiness
    if (config.isProduction) {
      console.log('\n🚀 Production Readiness Check:');
      console.log('==============================');
      
      const checks = [
        {
          name: 'Supabase URL',
          value: config.supabase.url,
          required: true,
        },
        {
          name: 'Supabase Anon Key',
          value: config.supabase.anonKey,
          required: true,
        },
        {
          name: 'CometChat App ID',
          value: config.cometchat.appId,
          required: config.features.messaging,
        },
        {
          name: 'Stripe Secret Key',
          value: config.stripe.secretKey,
          required: config.features.payments,
        },
        {
          name: 'JWT Secret (changed)',
          value: config.jwt.secret !== 'your-super-secret-jwt-key-change-in-production',
          required: true,
        },
        {
          name: 'Session Secret (changed)',
          value: config.security.sessionSecret !== 'your-super-secret-session-key-change-in-production',
          required: true,
        },
      ];

      let allPassed = true;
      checks.forEach(check => {
        const status = check.required ? (check.value ? '✅' : '❌') : (check.value ? '✅' : '⚠️');
        const required = check.required ? ' (required)' : ' (optional)';
        console.log(`  ${status} ${check.name}${required}`);
        
        if (check.required && !check.value) {
          allPassed = false;
        }
      });

      if (allPassed) {
        console.log('\n🎉 Production configuration is ready!');
      } else {
        console.log('\n❌ Production configuration is incomplete. Please fix the issues above.');
        process.exit(1);
      }
    }

    // Check for development warnings
    if (config.isDevelopment) {
      console.log('\n⚠️  Development Warnings:');
      console.log('========================');
      
      if (config.jwt.secret === 'your-super-secret-jwt-key-change-in-production') {
        console.log('  ⚠️  JWT_SECRET is using default value');
      }
      
      if (config.security.sessionSecret === 'your-super-secret-session-key-change-in-production') {
        console.log('  ⚠️  SESSION_SECRET is using default value');
      }
      
      if (!config.supabase.url) {
        console.log('  ⚠️  Supabase not configured (messaging will not work)');
      }
      
      if (!config.cometchat.appId) {
        console.log('  ⚠️  CometChat not configured (messaging will not work)');
      }
      
      if (!config.stripe.secretKey) {
        console.log('  ⚠️  Stripe not configured (payments will not work)');
      }
    }

    console.log('\n✨ Configuration validation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Configuration validation failed:');
    console.error(error.message);
    process.exit(1);
  }
};

main();
