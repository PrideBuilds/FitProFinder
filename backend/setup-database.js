import knex from 'knex';
import config from './knexfile.js';

const db = knex(config.development);

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create users table
    console.log('Creating users table...');
    await db.schema.createTable('users', (table) => {
      table.string('id', 36).primary();
      table.string('email', 255).notNullable().unique();
      table.string('password_hash', 255).notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).notNullable();
      table.string('role', 20).notNullable().defaultTo('client');
      table.string('phone_number', 20);
      table.text('profile_image_url');
      table.boolean('is_verified').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('email_verified_at');
      table.string('email_verification_token');
      table.string('password_reset_token');
      table.timestamp('password_reset_expires');
      table.timestamp('last_login_at');
      table.string('last_login_ip', 45);
      table.timestamps(true, true);
      table.index(['email']);
      table.index(['role']);
      table.index(['is_active']);
      table.index(['created_at']);
    });

    // Create trainer_profiles table
    console.log('Creating trainer_profiles table...');
    await db.schema.createTable('trainer_profiles', (table) => {
      table.string('id', 36).primary();
      table.string('user_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('bio');
      table.decimal('hourly_rate', 10, 2);
      table.string('location', 255);
      table.string('certifications', 1000);
      table.integer('years_experience');
      table.boolean('is_verified').defaultTo(false);
      table.boolean('is_featured').defaultTo(false);
      table.timestamps(true, true);
      table.index(['user_id']);
      table.index(['location']);
      table.index(['is_verified']);
      table.index(['is_featured']);
    });

    // Create specialties table
    console.log('Creating specialties table...');
    await db.schema.createTable('specialties', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.text('description');
      table.string('icon', 100);
      table.timestamps(true, true);
    });

    // Create trainer_specialties table
    console.log('Creating trainer_specialties table...');
    await db.schema.createTable('trainer_specialties', (table) => {
      table.increments('id').primary();
      table.string('trainer_id', 36).notNullable().references('id').inTable('trainer_profiles').onDelete('CASCADE');
      table.integer('specialty_id').notNullable().references('id').inTable('specialties').onDelete('CASCADE');
      table.timestamps(true, true);
      table.unique(['trainer_id', 'specialty_id']);
    });

    // Create session_types table
    console.log('Creating session_types table...');
    await db.schema.createTable('session_types', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.text('description');
      table.integer('duration_minutes').notNullable();
      table.decimal('base_price', 10, 2);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });

    // Create bookings table
    console.log('Creating bookings table...');
    await db.schema.createTable('bookings', (table) => {
      table.string('id', 36).primary();
      table.string('client_id', 36).notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('trainer_id', 36).notNullable().references('id').inTable('trainer_profiles').onDelete('CASCADE');
      table.integer('session_type_id').references('id').inTable('session_types');
      table.timestamp('start_time').notNullable();
      table.timestamp('end_time').notNullable();
      table.string('status', 20).notNullable().defaultTo('pending');
      table.text('notes');
      table.decimal('total_amount', 10, 2);
      table.string('location', 255);
      table.string('session_type', 50);
      table.timestamps(true, true);
      table.index(['client_id']);
      table.index(['trainer_id']);
      table.index(['start_time']);
      table.index(['status']);
    });

    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup error:', error);
  } finally {
    await db.destroy();
  }
}

setupDatabase(); 