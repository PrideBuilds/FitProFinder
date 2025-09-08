import { hashPassword } from '../../utils/auth.js';
import { randomUUID } from 'crypto';

export const seed = async knex => {
  console.log('Creating demo trainers...');

  // Create additional trainer users
  const trainerUsers = [
    {
      id: randomUUID(),
      email: 'mike.fitness@demo.com',
      password_hash: await hashPassword('demo123456'),
      first_name: 'Mike',
      last_name: 'Rodriguez',
      role: 'trainer',
      phone_number: '+1-555-0103',
      is_verified: true,
      is_active: true,
      profile_image_url:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: randomUUID(),
      email: 'emma.yoga@demo.com',
      password_hash: await hashPassword('demo123456'),
      first_name: 'Emma',
      last_name: 'Chen',
      role: 'trainer',
      phone_number: '+1-555-0104',
      is_verified: true,
      is_active: true,
      profile_image_url:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: randomUUID(),
      email: 'alex.strength@demo.com',
      password_hash: await hashPassword('demo123456'),
      first_name: 'Alex',
      last_name: 'Thompson',
      role: 'trainer',
      phone_number: '+1-555-0105',
      is_verified: true,
      is_active: true,
      profile_image_url:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  // Insert trainer users
  await knex('users').insert(trainerUsers);

  // Create trainer profiles
  const trainerProfiles = [
    {
      user_id: trainerUsers[0].id, // Mike
      business_name: 'Rodriguez Fitness',
      bio: 'Certified personal trainer with 8+ years helping clients achieve their fitness goals. Specializing in strength training, HIIT, and sports performance. Former collegiate athlete with a passion for helping others reach their potential.',
      experience_years: 8,
      address: '123 Fitness Ave',
      city: 'Los Angeles',
      state: 'CA',
      zip_code: '90210',
      country: 'US',
      latitude: 34.0522,
      longitude: -118.2437,
      rating: 4.8,
      review_count: 127,
      is_verified: true,
      subscription_tier: 'premium',
      social_links: JSON.stringify({
        instagram: '@mike_fitness',
        youtube: 'MikeRodriguezFit',
        website: 'www.rodriguezfitness.com',
      }),
      is_accepting_clients: true,
      offers_online_sessions: true,
      offers_in_person_sessions: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: trainerUsers[1].id, // Emma
      business_name: 'Zen Flow Yoga',
      bio: 'RYT-500 certified yoga instructor with a focus on mindful movement and stress relief. I help busy professionals find balance through yoga, meditation, and breathwork. 6 years of teaching experience.',
      experience_years: 6,
      address: '456 Wellness Way',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94102',
      country: 'US',
      latitude: 37.7749,
      longitude: -122.4194,
      rating: 4.9,
      review_count: 89,
      is_verified: true,
      subscription_tier: 'basic',
      social_links: JSON.stringify({
        instagram: '@emmachen_yoga',
        website: 'www.zenflowyoga.com',
      }),
      is_accepting_clients: true,
      offers_online_sessions: true,
      offers_in_person_sessions: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: trainerUsers[2].id, // Alex
      business_name: 'Thompson Strength Co.',
      bio: 'Powerlifting coach and strength specialist. Helping athletes and everyday people build serious strength safely. Certified Strength and Conditioning Specialist (CSCS) with 10+ years experience.',
      experience_years: 10,
      address: '789 Iron Street',
      city: 'Austin',
      state: 'TX',
      zip_code: '78701',
      country: 'US',
      latitude: 30.2672,
      longitude: -97.7431,
      rating: 4.7,
      review_count: 156,
      is_verified: true,
      subscription_tier: 'premium',
      social_links: JSON.stringify({
        instagram: '@alex_strength',
        youtube: 'ThompsonStrengthCo',
        website: 'www.thompsonstrength.com',
      }),
      is_accepting_clients: true,
      offers_online_sessions: false,
      offers_in_person_sessions: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  // Insert trainer profiles
  await knex('trainer_profiles').insert(trainerProfiles);

  // Add specialties for existing trainer (Sarah from demo users)
  const existingSarah = await knex('users')
    .where({ email: 'trainer@demo.com' })
    .first();
  if (existingSarah) {
    await knex('trainer_profiles').insert({
      user_id: existingSarah.id,
      business_name: 'Johnson Wellness',
      bio: 'Holistic wellness coach specializing in nutrition and lifestyle coaching. Helping clients create sustainable habits for long-term health and vitality. Certified Nutritionist and Personal Trainer.',
      experience_years: 5,
      address: '321 Health Blvd',
      city: 'Seattle',
      state: 'WA',
      zip_code: '98101',
      country: 'US',
      latitude: 47.6062,
      longitude: -122.3321,
      rating: 4.6,
      review_count: 73,
      is_verified: true,
      subscription_tier: 'basic',
      social_links: JSON.stringify({
        instagram: '@sarah_wellness',
        website: 'www.johnsonwellness.com',
      }),
      is_accepting_clients: true,
      offers_online_sessions: true,
      offers_in_person_sessions: true,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // Create trainer-specialty relationships
  const trainerSpecialties = [
    // Mike's specialties
    {
      trainer_id: trainerUsers[0].id,
      specialty_id: 1,
      is_primary: true,
      experience_years: 8,
    }, // Personal Training
    {
      trainer_id: trainerUsers[0].id,
      specialty_id: 4,
      is_primary: false,
      experience_years: 6,
    }, // Strength Training
    {
      trainer_id: trainerUsers[0].id,
      specialty_id: 8,
      is_primary: false,
      experience_years: 5,
    }, // Sports Performance
    {
      trainer_id: trainerUsers[0].id,
      specialty_id: 9,
      is_primary: false,
      experience_years: 4,
    }, // HIIT

    // Emma's specialties
    {
      trainer_id: trainerUsers[1].id,
      specialty_id: 2,
      is_primary: true,
      experience_years: 6,
    }, // Yoga
    {
      trainer_id: trainerUsers[1].id,
      specialty_id: 5,
      is_primary: false,
      experience_years: 4,
    }, // Pilates

    // Alex's specialties
    {
      trainer_id: trainerUsers[2].id,
      specialty_id: 4,
      is_primary: true,
      experience_years: 10,
    }, // Strength Training
    {
      trainer_id: trainerUsers[2].id,
      specialty_id: 1,
      is_primary: false,
      experience_years: 8,
    }, // Personal Training
    {
      trainer_id: trainerUsers[2].id,
      specialty_id: 8,
      is_primary: false,
      experience_years: 7,
    }, // Sports Performance

    // Sarah's specialties (existing demo user)
    {
      trainer_id: existingSarah?.id,
      specialty_id: 3,
      is_primary: true,
      experience_years: 5,
    }, // Nutrition
    {
      trainer_id: existingSarah?.id,
      specialty_id: 1,
      is_primary: false,
      experience_years: 3,
    }, // Personal Training
    {
      trainer_id: existingSarah?.id,
      specialty_id: 7,
      is_primary: false,
      experience_years: 4,
    }, // Weight Loss
  ].filter(item => item.trainer_id); // Filter out any undefined trainer_ids

  await knex('trainer_specialties').insert(trainerSpecialties);

  console.log('✅ Demo trainers created successfully');
  console.log('Demo trainer accounts:');
  console.log(
    '- mike.fitness@demo.com / demo123456 (Strength & Sports Performance)'
  );
  console.log('- emma.yoga@demo.com / demo123456 (Yoga & Pilates)');
  console.log(
    '- alex.strength@demo.com / demo123456 (Powerlifting & Strength)'
  );
  console.log('- trainer@demo.com / demo123456 (Nutrition & Wellness)');
};
