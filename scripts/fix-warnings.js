#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔧 Fixing deployment warnings...\n');

// 1. Generate a secure JWT secret
const generateSecureSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// 2. Fix JWT_SECRET in .env file
const fixJWTSecret = () => {
  const envPath = path.join(rootDir, 'backend/.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if it's using the default JWT secret
    if (envContent.includes('your-super-secret-jwt-key-change-this-in-production')) {
      const newSecret = generateSecureSecret();
      envContent = envContent.replace(
        /JWT_SECRET=your-super-secret-jwt-key-change-this-in-production/g,
        `JWT_SECRET=${newSecret}`
      );
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Generated secure JWT_SECRET');
      console.log(`📋 New JWT_SECRET: ${newSecret.substring(0, 20)}...`);
    } else {
      console.log('✅ JWT_SECRET already configured');
    }
  }
};

// 3. Remove debug console.log statements from auth utilities
const removeDebugLogs = () => {
  const authPath = path.join(rootDir, 'backend/src/utils/auth.js');
  
  if (fs.existsSync(authPath)) {
    let content = fs.readFileSync(authPath, 'utf8');
    let modified = false;
    
    // Remove debug console.log statements (keep error logs)
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      // Remove debug logs but keep error/info logs
      if (trimmed.startsWith('console.log') && 
          (trimmed.includes('🔍') || trimmed.includes('Creating token') || trimmed.includes('Using JWT_SECRET'))) {
        modified = true;
        return false;
      }
      return true;
    });
    
    if (modified) {
      fs.writeFileSync(authPath, filteredLines.join('\n'));
      console.log('✅ Removed debug console.log statements from auth utilities');
    } else {
      console.log('✅ No debug logs found in auth utilities');
    }
  }
};

// 4. Set NODE_ENV to production
const setProductionEnv = () => {
  const envPath = path.join(rootDir, 'backend/.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('NODE_ENV=development')) {
      envContent = envContent.replace(/NODE_ENV=development/g, 'NODE_ENV=production');
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Set NODE_ENV to production');
    } else if (!envContent.includes('NODE_ENV=production')) {
      envContent += '\nNODE_ENV=production\n';
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Added NODE_ENV=production');
    } else {
      console.log('✅ NODE_ENV already set to production');
    }
  }
};

// Run all fixes
try {
  fixJWTSecret();
  removeDebugLogs();
  setProductionEnv();
  
  console.log('\n🎉 All warnings fixed! Ready for production deployment.');
  console.log('\n📝 Next steps:');
  console.log('   1. Run the audit again: node scripts/pre-deployment-audit.js');
  console.log('   2. Follow the deployment guide: deploy-guide.md');
  console.log('   3. Test locally before deploying: npm run build && cd backend && npm start');
  
} catch (error) {
  console.error('❌ Error fixing warnings:', error.message);
  process.exit(1);
} 