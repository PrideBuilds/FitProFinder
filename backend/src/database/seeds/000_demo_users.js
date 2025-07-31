import { hashPassword } from '../../utils/auth.js';
import { randomUUID } from 'crypto';

export const seed = async (knex) => {
  // Delete existing demo users
  await knex('users').whereIn('email', [
    'client@demo.com',
    'trainer@demo.com'
  ]).del();

  // Hash passwords for demo users
  const clientPasswordHash = await hashPassword('demo123456');
  const trainerPasswordHash = await hashPassword('demo123456');

  // Insert demo users
  await knex('users').insert([
    {
      id: randomUUID(),
      email: 'client@demo.com',
      password_hash: clientPasswordHash,
      first_name: 'John',
      last_name: 'Smith',
      role: 'client',
      phone_number: '+1-555-0101',
      is_verified: true,
      is_active: true,
      profile_image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: randomUUID(),
      email: 'trainer@demo.com',
      password_hash: trainerPasswordHash,
      first_name: 'Sarah',
      last_name: 'Johnson',
      role: 'trainer',
      phone_number: '+1-555-0102',
      is_verified: true,
      is_active: true,
      profile_image_url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=150&h=150&fit=crop&crop=face',
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  console.log('Demo users seeded successfully!');
  console.log('Client: client@demo.com / demo123456');
  console.log('Trainer: trainer@demo.com / demo123456');
}; 