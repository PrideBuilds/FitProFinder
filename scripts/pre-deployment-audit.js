#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

class PreDeploymentAudit {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(type, message, details = '') {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, message, details };
    
    if (type === 'error') {
      this.errors.push(entry);
      console.log(`❌ ${message}${details ? ` - ${details}` : ''}`);
    } else if (type === 'warning') {
      this.warnings.push(entry);
      console.log(`⚠️  ${message}${details ? ` - ${details}` : ''}`);
    } else {
      this.passed.push(entry);
      console.log(`✅ ${message}`);
    }
  }

  checkFileExists(filePath, description) {
    const fullPath = path.join(rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      this.log('pass', `${description} exists`);
      return true;
    } else {
      this.log('error', `Missing: ${description}`, filePath);
      return false;
    }
  }

  checkDirectoryStructure() {
    console.log('\n🏗️  Checking Directory Structure...');
    
    const requiredDirs = [
      'src',
      'backend/src',
      'backend/src/routes',
      'backend/src/middleware',
      'backend/src/services',
      'backend/src/utils',
      'backend/src/database',
      'backend/src/database/migrations',
      'backend/src/database/seeds'
    ];

    requiredDirs.forEach(dir => {
      const fullPath = path.join(rootDir, dir);
      if (fs.existsSync(fullPath)) {
        this.log('pass', `Directory: ${dir}`);
      } else {
        this.log('error', `Missing directory: ${dir}`);
      }
    });
  }

  checkCriticalFiles() {
    console.log('\n📁 Checking Critical Files...');
    
    const criticalFiles = [
      { path: 'package.json', desc: 'Frontend package.json' },
      { path: 'backend/package.json', desc: 'Backend package.json' },
      { path: 'backend/src/index.js', desc: 'Backend entry point' },
      { path: 'backend/src/middleware/auth.js', desc: 'Auth middleware' },
      { path: 'backend/src/middleware/validation.js', desc: 'Validation middleware' },
      { path: 'backend/src/utils/auth.js', desc: 'Auth utilities' },
      { path: 'backend/src/utils/ApiError.js', desc: 'API Error handler' },
      { path: 'backend/src/services/messagingService.js', desc: 'Messaging service' },
      { path: 'backend/src/services/socketService.js', desc: 'Socket service' },
      { path: 'src/utils/api.ts', desc: 'Frontend API utilities' },
      { path: 'src/scripts/messaging.ts', desc: 'Frontend messaging script' }
    ];

    criticalFiles.forEach(file => {
      this.checkFileExists(file.path, file.desc);
    });
  }

  checkPackageFiles() {
    console.log('\n📦 Checking Package Dependencies...');
    
    try {
      // Check frontend package.json
      const frontendPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json')));
      if (frontendPkg.dependencies) {
        this.log('pass', 'Frontend dependencies defined');
      } else {
        this.log('warning', 'No frontend dependencies found');
      }

      // Check backend package.json
      const backendPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'backend/package.json')));
      if (backendPkg.dependencies) {
        this.log('pass', 'Backend dependencies defined');
      } else {
        this.log('error', 'No backend dependencies found');
      }

      // Check for required backend dependencies
      const requiredDeps = ['express', 'jsonwebtoken', 'bcryptjs', 'knex', 'socket.io'];
      requiredDeps.forEach(dep => {
        if (backendPkg.dependencies && backendPkg.dependencies[dep]) {
          this.log('pass', `Required dependency: ${dep}`);
        } else {
          this.log('error', `Missing required dependency: ${dep}`);
        }
      });

    } catch (error) {
      this.log('error', 'Failed to read package.json files', error.message);
    }
  }

  checkEnvironmentConfig() {
    console.log('\n🔧 Checking Environment Configuration...');
    
    // Check if .env example exists
    this.checkFileExists('backend/env.example', 'Environment example file');
    
    // Check for actual .env file
    const envPath = path.join(rootDir, 'backend/.env');
    if (fs.existsSync(envPath)) {
      this.log('pass', 'Backend .env file exists');
      
      try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const requiredEnvVars = [
          'JWT_SECRET',
          'NODE_ENV',
          'PORT',
          'FRONTEND_URL'
        ];
        
        requiredEnvVars.forEach(envVar => {
          if (envContent.includes(`${envVar}=`)) {
            this.log('pass', `Environment variable: ${envVar}`);
          } else {
            this.log('error', `Missing environment variable: ${envVar}`);
          }
        });

        // Check JWT_SECRET strength
        const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
        if (jwtMatch && jwtMatch[1]) {
          const secret = jwtMatch[1].trim();
          if (secret.length < 32) {
            this.log('warning', 'JWT_SECRET should be at least 32 characters long');
          } else if (secret === 'your-super-secret-jwt-key-change-this-in-production') {
            this.log('warning', 'JWT_SECRET is using default value - change for production');
          } else {
            this.log('pass', 'JWT_SECRET is properly configured');
          }
        }

      } catch (error) {
        this.log('error', 'Failed to read .env file', error.message);
      }
    } else {
      this.log('error', 'Backend .env file missing - copy from env.example');
    }
  }

  async checkCodeSyntax() {
    console.log('\n🔍 Checking Code Syntax...');
    
    const checkJSFile = async (filePath, description) => {
      const fullPath = path.join(rootDir, filePath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Basic syntax checks
          if (content.includes('import ') && content.includes('require(')) {
            this.log('warning', `Mixed imports in ${description}`, 'Use either ES6 imports or CommonJS, not both');
          }
          
          // Check for common errors
          if (content.includes('console.log') && !filePath.includes('test')) {
            this.log('warning', `Console.log found in ${description}`, 'Remove for production');
          }
          
          this.log('pass', `Syntax check passed: ${description}`);
        } catch (error) {
          this.log('error', `Syntax error in ${description}`, error.message);
        }
      }
    };

    await checkJSFile('backend/src/index.js', 'Backend entry point');
    await checkJSFile('backend/src/utils/auth.js', 'Auth utilities');
    await checkJSFile('backend/src/services/messagingService.js', 'Messaging service');
  }

  checkSecurityIssues() {
    console.log('\n🔒 Checking Security Issues...');
    
    // Check for common security issues
    const checkSecurityInFile = (filePath, description) => {
      const fullPath = path.join(rootDir, filePath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for hardcoded secrets
        if (content.match(/password\s*=\s*['"]\w+['"]/i) && !filePath.includes('example')) {
          this.log('warning', `Possible hardcoded password in ${description}`);
        }
        
        // Check for SQL injection risks
        if (content.includes('SELECT ') && content.includes('${') && !content.includes('knex')) {
          this.log('warning', `Possible SQL injection risk in ${description}`);
        }
        
        // Check for CORS configuration
        if (filePath.includes('index.js') && !content.includes('cors')) {
          this.log('warning', 'CORS not configured', 'May cause issues in production');
        }
        
        this.log('pass', `Security check passed: ${description}`);
      }
    };

    checkSecurityInFile('backend/src/index.js', 'Backend entry point');
    checkSecurityInFile('backend/src/utils/auth.js', 'Auth utilities');
  }

  checkDatabaseConfiguration() {
    console.log('\n🗄️  Checking Database Configuration...');
    
    // Check knexfile
    const knexfilePath = path.join(rootDir, 'backend/knexfile.js');
    if (fs.existsSync(knexfilePath)) {
      this.log('pass', 'Knex configuration file exists');
      
      try {
        const content = fs.readFileSync(knexfilePath, 'utf8');
        if (content.includes('production')) {
          this.log('pass', 'Production database configuration found');
        } else {
          this.log('warning', 'No production database configuration');
        }
      } catch (error) {
        this.log('error', 'Failed to read knexfile.js', error.message);
      }
    } else {
      this.log('warning', 'No knexfile.js found');
    }

    // Check migrations
    const migrationsDir = path.join(rootDir, 'backend/src/database/migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir);
      if (migrations.length > 0) {
        this.log('pass', `Found ${migrations.length} database migrations`);
      } else {
        this.log('warning', 'No database migrations found');
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRE-DEPLOYMENT AUDIT REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n✅ Passed: ${this.passed.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n🚨 CRITICAL ERRORS - Must fix before deployment:');
      this.errors.forEach(error => {
        console.log(`   • ${error.message}`);
        if (error.details) console.log(`     ${error.details}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS - Recommended to fix:');
      this.warnings.forEach(warning => {
        console.log(`   • ${warning.message}`);
        if (warning.details) console.log(`     ${warning.details}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.errors.length === 0) {
      console.log('🎉 Ready for deployment! No critical errors found.');
      if (this.warnings.length > 0) {
        console.log('💡 Consider addressing warnings for optimal production performance.');
      }
      return true;
    } else {
      console.log('🛑 NOT ready for deployment. Please fix critical errors first.');
      return false;
    }
  }

  async runAudit() {
    console.log('🔍 Starting Pre-Deployment Audit...\n');
    
    this.checkDirectoryStructure();
    this.checkCriticalFiles();
    this.checkPackageFiles();
    this.checkEnvironmentConfig();
    await this.checkCodeSyntax();
    this.checkSecurityIssues();
    this.checkDatabaseConfiguration();
    
    return this.generateReport();
  }
}

// Run the audit
const audit = new PreDeploymentAudit();
audit.runAudit().then(isReady => {
  process.exit(isReady ? 0 : 1);
}).catch(error => {
  console.error('❌ Audit failed:', error);
  process.exit(1);
}); 