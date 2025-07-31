import knex from 'knex';
import config from './knexfile.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const db = knex(config.development);

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Seed specialties
    console.log('Seeding specialties...');
    const specialties = [
      { name: 'Personal Training', description: 'One-on-one fitness training', icon: 'dumbbell' },
      { name: 'Yoga', description: 'Mind and body wellness', icon: 'lotus' },
      { name: 'Nutrition Coaching', description: 'Diet and nutrition guidance', icon: 'apple' },
      { name: 'CrossFit', description: 'High-intensity functional fitness', icon: 'fire' },
      { name: 'Pilates', description: 'Core strength and flexibility', icon: 'balance' },
      { name: 'Cardio Training', description: 'Cardiovascular fitness', icon: 'heart' },
      { name: 'Strength Training', description: 'Muscle building and strength', icon: 'muscle' },
      { name: 'Rehabilitation', description: 'Injury recovery and physical therapy', icon: 'healing' }
    ];
    
    await db('specialties').insert(specialties);
    console.log('Specialties seeded successfully!');
    
    // Seed demo users
    console.log('Seeding demo users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        id: uuidv4(),
        email: 'admin@fitprofinder.com',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_verified: true,
        is_active: true
      },
      {
        id: uuidv4(),
        email: 'john.trainer@example.com',
        password_hash: hashedPassword,
        first_name: 'John',
        last_name: 'Smith',
        role: 'trainer',
        phone_number: '+1-555-0123',
        is_verified: true,
        is_active: true
      },
      {
        id: uuidv4(),
        email: 'sarah.yoga@example.com',
        password_hash: hashedPassword,
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'trainer',
        phone_number: '+1-555-0124',
        is_verified: true,
        is_active: true
      },
      {
        id: uuidv4(),
        email: 'mike.client@example.com',
        password_hash: hashedPassword,
        first_name: 'Mike',
        last_name: 'Davis',
        role: 'client',
        phone_number: '+1-555-0125',
        is_verified: true,
        is_active: true
      }
    ];
    
    await db('users').insert(users);
    console.log('Users seeded successfully!');
    
    // Get user IDs for trainer profiles
    const johnUser = await db('users').where('email', 'john.trainer@example.com').first();
    const sarahUser = await db('users').where('email', 'sarah.yoga@example.com').first();
    
    // Seed trainer profiles
    console.log('Seeding trainer profiles...');
    const trainerProfiles = [
      {
        id: uuidv4(),
        user_id: johnUser.id,
        bio: 'Certified personal trainer with 8+ years of experience helping clients achieve their fitness goals. Specializing in strength training and weight loss.',
        hourly_rate: 75.00,
        location: 'New York, NY',
        certifications: 'NASM Certified Personal Trainer, CPR/AED Certified',
        years_experience: 8,
        is_verified: true,
        is_featured: true
      },
      {
        id: uuidv4(),
        user_id: sarahUser.id,
        bio: 'Experienced yoga instructor passionate about helping others find balance and wellness through mindful movement and meditation.',
        hourly_rate: 60.00,
        location: 'Los Angeles, CA',
        certifications: 'RYT-500 Yoga Alliance, Meditation Teacher Certification',
        years_experience: 5,
        is_verified: true,
        is_featured: false
      }
    ];
    
    await db('trainer_profiles').insert(trainerProfiles);
    console.log('Trainer profiles seeded successfully!');
    
    // Get trainer profile IDs and specialty IDs
    const johnProfile = await db('trainer_profiles').where('user_id', johnUser.id).first();
    const sarahProfile = await db('trainer_profiles').where('user_id', sarahUser.id).first();
    const personalTraining = await db('specialties').where('name', 'Personal Training').first();
    const strengthTraining = await db('specialties').where('name', 'Strength Training').first();
    const yoga = await db('specialties').where('name', 'Yoga').first();
    
    // Seed trainer specialties
    console.log('Seeding trainer specialties...');
    const trainerSpecialties = [
      { trainer_id: johnProfile.id, specialty_id: personalTraining.id },
      { trainer_id: johnProfile.id, specialty_id: strengthTraining.id },
      { trainer_id: sarahProfile.id, specialty_id: yoga.id }
    ];
    
    await db('trainer_specialties').insert(trainerSpecialties);
    console.log('Trainer specialties seeded successfully!');
    
    // Seed session types
    console.log('Seeding session types...');
    const sessionTypes = [
      { name: 'Personal Training Session', description: 'One-on-one fitness training', duration_minutes: 60, base_price: 75.00 },
      { name: 'Yoga Session', description: 'Individual yoga instruction', duration_minutes: 60, base_price: 60.00 },
      { name: 'Nutrition Consultation', description: 'Diet and nutrition planning', duration_minutes: 45, base_price: 50.00 },
      { name: 'Group Training', description: 'Small group fitness session', duration_minutes: 60, base_price: 40.00 }
    ];
    
    await db('session_types').insert(sessionTypes);
    console.log('Session types seeded successfully!');
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Database seeding error:', error);
  } finally {
    await db.destroy();
  }
}

seedDatabase(); 