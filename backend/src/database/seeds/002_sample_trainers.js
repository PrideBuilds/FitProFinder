import { hashPassword } from '../../utils/auth.js';

export const seed = async knex => {
  // Delete existing entries
  await knex('session_types').del();
  await knex('trainer_specialties').del();
  await knex('trainer_profiles').del();
  await knex('users').where('role', 'trainer').del();

  // Sample trainer data
  const trainers = [
    {
      email: 'sarah.fitness@example.com',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      phoneNumber: '+1-555-0101',
      businessName: 'Sarah Johnson Fitness',
      bio: 'Certified personal trainer with 8 years of experience helping clients achieve their fitness goals. Specializing in strength training, weight loss, and functional fitness.',
      experienceYears: 8,
      address: '123 Fitness Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      latitude: 34.0736,
      longitude: -118.4004,
      specialties: [1, 4, 7], // Personal Training, Strength Training, Weight Loss
      isVerified: true,
      sessionTypes: [
        {
          name: '1-on-1 Personal Training',
          duration: 60,
          price: 120,
          type: 'individual',
        },
        {
          name: 'Strength Training Session',
          duration: 45,
          price: 100,
          type: 'individual',
        },
        {
          name: 'Group Fitness Class',
          duration: 60,
          price: 35,
          type: 'group',
          maxParticipants: 8,
        },
      ],
    },
    {
      email: 'mike.yoga@example.com',
      password: 'password123',
      firstName: 'Mike',
      lastName: 'Chen',
      phoneNumber: '+1-555-0102',
      businessName: 'Zen Yoga Studio',
      bio: 'Experienced yoga instructor and wellness coach. I help people find balance through mindful movement and breath work. 500hr certified yoga teacher.',
      experienceYears: 6,
      address: '456 Wellness St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      latitude: 37.7749,
      longitude: -122.4194,
      specialties: [2, 5], // Yoga, Pilates
      isVerified: true,
      sessionTypes: [
        {
          name: 'Private Yoga Session',
          duration: 90,
          price: 140,
          type: 'individual',
        },
        {
          name: 'Couples Yoga',
          duration: 75,
          price: 180,
          type: 'group',
          maxParticipants: 2,
        },
        { name: 'Pilates Class', duration: 60, price: 80, type: 'individual' },
      ],
    },
    {
      email: 'jessica.nutrition@example.com',
      password: 'password123',
      firstName: 'Jessica',
      lastName: 'Rodriguez',
      phoneNumber: '+1-555-0103',
      businessName: 'Healthy Living Nutrition',
      bio: 'Registered Dietitian and certified nutrition coach. I create personalized meal plans and provide ongoing support to help you develop sustainable healthy eating habits.',
      experienceYears: 5,
      address: '789 Health Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      latitude: 30.2672,
      longitude: -97.7431,
      specialties: [3, 7], // Nutrition, Weight Loss
      isVerified: true,
      sessionTypes: [
        {
          name: 'Nutrition Consultation',
          duration: 60,
          price: 95,
          type: 'individual',
        },
        {
          name: 'Meal Planning Session',
          duration: 45,
          price: 75,
          type: 'individual',
        },
        {
          name: 'Nutrition Workshop',
          duration: 120,
          price: 45,
          type: 'group',
          maxParticipants: 12,
        },
      ],
    },
    {
      email: 'alex.hiit@example.com',
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Thompson',
      phoneNumber: '+1-555-0104',
      businessName: 'HIIT Zone Training',
      bio: 'High-intensity interval training specialist and former collegiate athlete. I design challenging workouts that maximize results in minimal time.',
      experienceYears: 4,
      address: '321 Performance Dr',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      latitude: 25.7617,
      longitude: -80.1918,
      specialties: [9, 6, 1], // HIIT, Cardio, Personal Training
      isVerified: true,
      sessionTypes: [
        {
          name: 'HIIT Training Session',
          duration: 30,
          price: 85,
          type: 'individual',
        },
        { name: 'Cardio Blast', duration: 45, price: 70, type: 'individual' },
        {
          name: 'Group HIIT Class',
          duration: 45,
          price: 25,
          type: 'group',
          maxParticipants: 10,
        },
      ],
    },
    {
      email: 'david.sports@example.com',
      password: 'password123',
      firstName: 'David',
      lastName: 'Wilson',
      phoneNumber: '+1-555-0105',
      businessName: 'Elite Sports Performance',
      bio: 'Sports performance coach working with athletes of all levels. Former Division I track coach with expertise in speed, agility, and sports-specific training.',
      experienceYears: 12,
      address: '654 Athletic Way',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      latitude: 39.7392,
      longitude: -104.9903,
      specialties: [8, 4, 1], // Sports Performance, Strength Training, Personal Training
      isVerified: true,
      sessionTypes: [
        {
          name: 'Sports Performance Training',
          duration: 75,
          price: 130,
          type: 'individual',
        },
        {
          name: 'Speed & Agility Session',
          duration: 60,
          price: 110,
          type: 'individual',
        },
        {
          name: 'Team Training',
          duration: 90,
          price: 60,
          type: 'group',
          maxParticipants: 6,
        },
      ],
    },
    {
      email: 'lisa.rehab@example.com',
      password: 'password123',
      firstName: 'Lisa',
      lastName: 'Martinez',
      phoneNumber: '+1-555-0106',
      businessName: 'Recovery & Wellness',
      bio: 'Licensed physical therapist and corrective exercise specialist. I help clients recover from injuries and prevent future problems through targeted exercise programs.',
      experienceYears: 10,
      address: '987 Recovery Rd',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      latitude: 47.6062,
      longitude: -122.3321,
      specialties: [10, 1], // Injury Recovery, Personal Training
      isVerified: true,
      sessionTypes: [
        {
          name: 'Corrective Exercise Session',
          duration: 60,
          price: 125,
          type: 'individual',
        },
        {
          name: 'Injury Prevention Training',
          duration: 45,
          price: 100,
          type: 'individual',
        },
        {
          name: 'Recovery Workshop',
          duration: 90,
          price: 40,
          type: 'group',
          maxParticipants: 8,
        },
      ],
    },
  ];

  // Create users and profiles
  for (const trainer of trainers) {
    // Hash password
    const passwordHash = await hashPassword(trainer.password);

    // Insert user
    const [user] = await knex('users')
      .insert({
        email: trainer.email,
        password_hash: passwordHash,
        first_name: trainer.firstName,
        last_name: trainer.lastName,
        role: 'trainer',
        phone_number: trainer.phoneNumber,
        is_verified: trainer.isVerified,
        profile_image_url: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000) + 1500000000000}?w=150&h=150&fit=crop&crop=face`,
      })
      .returning('*');

    // Insert trainer profile
    await knex('trainer_profiles').insert({
      user_id: user.id,
      business_name: trainer.businessName,
      bio: trainer.bio,
      experience_years: trainer.experienceYears,
      address: trainer.address,
      city: trainer.city,
      state: trainer.state,
      zip_code: trainer.zipCode,
      latitude: trainer.latitude,
      longitude: trainer.longitude,
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      review_count: Math.floor(Math.random() * 50) + 10, // Random reviews 10-59
      is_verified: trainer.isVerified,
      is_accepting_clients: true,
      offers_online_sessions: Math.random() > 0.5,
      offers_in_person_sessions: true,
    });

    // Insert specialties
    for (let i = 0; i < trainer.specialties.length; i++) {
      await knex('trainer_specialties').insert({
        trainer_id: user.id,
        specialty_id: trainer.specialties[i],
        experience_years:
          Math.floor(Math.random() * trainer.experienceYears) + 1,
        is_primary: i === 0,
      });
    }

    // Insert session types
    for (const sessionType of trainer.sessionTypes) {
      await knex('session_types').insert({
        trainer_id: user.id,
        name: sessionType.name,
        description: `Professional ${sessionType.name.toLowerCase()} with expert guidance and personalized attention.`,
        duration_minutes: sessionType.duration,
        price: sessionType.price,
        type: sessionType.type,
        max_participants: sessionType.maxParticipants || 1,
        min_participants: 1,
        is_active: true,
        allows_online: Math.random() > 0.5,
        allows_in_person: true,
      });
    }
  }

  console.log('✅ Sample trainers created successfully');
};
