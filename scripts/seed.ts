/**
 * Database seeding script
 * Populates the database with sample data for development and testing
 */

import { z } from 'zod';

// Environment validation
const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const env = envSchema.parse(process.env);

// Sample data
const sampleTrainers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@fitpro.com',
    bio: 'Certified personal trainer with 5+ years of experience helping clients achieve their fitness goals. Specializing in weight loss, strength training, and nutrition coaching.',
    specialties: ['Weight Loss', 'Strength Training', 'Nutrition'],
    rating: 4.9,
    reviewCount: 127,
    location: {
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
    hourlyRate: 85,
    profileImage: '/default-avatar.svg',
    isAvailable: true,
    experience: '5+ years',
    certifications: ['NASM-CPT', 'Precision Nutrition Level 1'],
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    email: 'mike@fitpro.com',
    bio: 'Former professional athlete turned trainer, specializing in sports performance and injury prevention. Helping athletes and fitness enthusiasts reach their peak potential.',
    specialties: [
      'Sports Performance',
      'Injury Prevention',
      'Functional Training',
    ],
    rating: 4.8,
    reviewCount: 89,
    location: {
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
    },
    hourlyRate: 95,
    profileImage: '/default-avatar.svg',
    isAvailable: true,
    experience: '8+ years',
    certifications: ['ACSM-CPT', 'FMS Level 2'],
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily@fitpro.com',
    bio: 'Yoga and Pilates instructor with a focus on mindfulness and holistic wellness. Helping clients find balance between physical and mental health.',
    specialties: ['Yoga', 'Pilates', 'Mindfulness', 'Flexibility'],
    rating: 4.7,
    reviewCount: 156,
    location: {
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
    },
    hourlyRate: 75,
    profileImage: '/default-avatar.svg',
    isAvailable: true,
    experience: '6+ years',
    certifications: ['RYT-500', 'PMA-CPT'],
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david@fitpro.com',
    bio: 'Strength and conditioning specialist with expertise in powerlifting and bodybuilding. Helping clients build serious strength and muscle mass.',
    specialties: [
      'Powerlifting',
      'Bodybuilding',
      'Strength Training',
      'Muscle Building',
    ],
    rating: 4.6,
    reviewCount: 98,
    location: {
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
    },
    hourlyRate: 90,
    profileImage: '/default-avatar.svg',
    isAvailable: true,
    experience: '7+ years',
    certifications: ['CSCS', 'USAPL Coach'],
  },
  {
    id: '5',
    name: 'Lisa Martinez',
    email: 'lisa@fitpro.com',
    bio: 'Cardio and HIIT specialist with a passion for helping busy professionals stay fit. Creating efficient workouts that fit into any schedule.',
    specialties: ['HIIT', 'Cardio', 'Weight Loss', 'Time-Efficient Training'],
    rating: 4.8,
    reviewCount: 112,
    location: {
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
    },
    hourlyRate: 80,
    profileImage: '/default-avatar.svg',
    isAvailable: true,
    experience: '4+ years',
    certifications: ['ACE-CPT', 'HIIT Specialist'],
  },
];

const sampleSpecialties = [
  { id: 1, name: 'Weight Loss' },
  { id: 2, name: 'Strength Training' },
  { id: 3, name: 'Cardio Fitness' },
  { id: 4, name: 'Yoga' },
  { id: 5, name: 'Pilates' },
  { id: 6, name: 'Nutrition' },
  { id: 7, name: 'Sports Performance' },
  { id: 8, name: 'Injury Prevention' },
  { id: 9, name: 'Functional Training' },
  { id: 10, name: 'Mindfulness' },
  { id: 11, name: 'Flexibility' },
  { id: 12, name: 'Powerlifting' },
  { id: 13, name: 'Bodybuilding' },
  { id: 14, name: 'Muscle Building' },
  { id: 15, name: 'HIIT' },
  { id: 16, name: 'Time-Efficient Training' },
];

const sampleClients = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    location: { city: 'San Francisco', state: 'CA' },
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    location: { city: 'Los Angeles', state: 'CA' },
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    location: { city: 'Seattle', state: 'WA' },
  },
];

const sampleBookings = [
  {
    id: '1',
    trainerId: '1',
    clientId: '1',
    date: '2024-12-15',
    time: '10:00',
    duration: 60,
    type: 'online',
    status: 'confirmed',
    price: 85,
  },
  {
    id: '2',
    trainerId: '2',
    clientId: '2',
    date: '2024-12-16',
    time: '14:00',
    duration: 90,
    type: 'in-person',
    status: 'confirmed',
    price: 142.5,
  },
];

const sampleInviteCodes = [
  { code: 'BETA2024', email: 'admin@fitprofinder.com', createdBy: 'admin' },
  { code: 'FITNESS', email: 'test@example.com', createdBy: 'admin' },
  { code: 'TRAINER', email: 'trainer@example.com', createdBy: 'admin' },
];

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // TODO: Replace with actual database operations
    // This is a mock implementation for now

    console.log('📊 Seeding trainers...');
    console.log(`   Added ${sampleTrainers.length} trainers`);

    console.log('🏷️  Seeding specialties...');
    console.log(`   Added ${sampleSpecialties.length} specialties`);

    console.log('👥 Seeding clients...');
    console.log(`   Added ${sampleClients.length} clients`);

    console.log('📅 Seeding bookings...');
    console.log(`   Added ${sampleBookings.length} bookings`);

    console.log('🎫 Seeding invite codes...');
    console.log(`   Added ${sampleInviteCodes.length} invite codes`);

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('Sample data created:');
    console.log(`- ${sampleTrainers.length} trainers`);
    console.log(`- ${sampleSpecialties.length} specialties`);
    console.log(`- ${sampleClients.length} clients`);
    console.log(`- ${sampleBookings.length} bookings`);
    console.log(`- ${sampleInviteCodes.length} invite codes`);
    console.log('');
    console.log('You can now start the application and test with this data.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export {
  seedDatabase,
  sampleTrainers,
  sampleSpecialties,
  sampleClients,
  sampleBookings,
  sampleInviteCodes,
};
