export const seed = async (knex) => {
  // First, get trainer IDs
  const trainers = await knex('trainer_profiles').select('user_id', 'business_name');
  
  if (trainers.length === 0) {
    console.log('No trainers found, skipping booking seed data');
    return;
  }

  // Clear existing data
  await knex('calendar_integrations').del();
  await knex('availability_slots').del();
  await knex('bookings').del();
  await knex('session_types').del();

  // Create session types for each trainer
  const sessionTypes = [];
  
  for (const trainer of trainers) {
    const trainerSessionTypes = [
      {
        id: knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"),
        trainer_id: trainer.user_id,
        name: 'Personal Training Session',
        description: 'One-on-one personalized training session tailored to your fitness goals.',
        duration_minutes: 60,
        price: 80.00,
        type: 'individual',
        max_participants: 1,
        min_participants: 1,
        is_active: true,
        allows_online: true,
        allows_in_person: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"),
        trainer_id: trainer.user_id,
        name: 'Quick Consultation',
        description: 'Short consultation to discuss your fitness goals and create a plan.',
        duration_minutes: 30,
        price: 45.00,
        type: 'individual',
        max_participants: 1,
        min_participants: 1,
        is_active: true,
        allows_online: true,
        allows_in_person: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"),
        trainer_id: trainer.user_id,
        name: 'Group Training Session',
        description: 'Small group training session for 2-4 people.',
        duration_minutes: 90,
        price: 35.00,
        type: 'group',
        max_participants: 4,
        min_participants: 2,
        is_active: true,
        allows_online: false,
        allows_in_person: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"),
        trainer_id: trainer.user_id,
        name: '4-Week Training Package',
        description: 'Package of 8 personal training sessions over 4 weeks.',
        duration_minutes: 60,
        price: 600.00,
        type: 'package',
        max_participants: 1,
        min_participants: 1,
        session_count: 8,
        validity_days: 30,
        is_active: true,
        allows_online: true,
        allows_in_person: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    sessionTypes.push(...trainerSessionTypes);
  }

  await knex('session_types').insert(sessionTypes);

  // Create availability slots for each trainer
  const availabilitySlots = [];
  
  for (const trainer of trainers) {
    // Create weekly recurring availability
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    
    for (const day of weekDays) {
      // Morning slots (9 AM - 12 PM)
      availabilitySlots.push({
        id: knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"),
        trainer_id: trainer.user_id,
        start_time: '2024-12-02 09:00:00', // Monday Dec 2, 2024
        end_time: '2024-12-02 12:00:00',
        day_of_week: day,
        slot_type: 'regular',
        is_recurring: true,
        recurrence_start_date: '2024-12-02',
        recurrence_end_date: '2025-12-02',
        max_bookings: 1,
        buffer_minutes_before: 15,
        buffer_minutes_after: 15,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Afternoon slots (2 PM - 6 PM)
      availabilitySlots.push({
        id: knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"),
        trainer_id: trainer.user_id,
        start_time: '2024-12-02 14:00:00',
        end_time: '2024-12-02 18:00:00',
        day_of_week: day,
        slot_type: 'regular',
        is_recurring: true,
        recurrence_start_date: '2024-12-02',
        recurrence_end_date: '2025-12-02',
        max_bookings: 1,
        buffer_minutes_before: 15,
        buffer_minutes_after: 15,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Weekend availability (Saturday morning)
    availabilitySlots.push({
      id: knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"),
      trainer_id: trainer.user_id,
      start_time: '2024-12-07 08:00:00', // Saturday
      end_time: '2024-12-07 12:00:00',
      day_of_week: 'saturday',
      slot_type: 'regular',
      is_recurring: true,
      recurrence_start_date: '2024-12-07',
      recurrence_end_date: '2025-12-07',
      max_bookings: 2, // Can take group sessions on weekends
      buffer_minutes_before: 15,
      buffer_minutes_after: 15,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  await knex('availability_slots').insert(availabilitySlots);

  // Create sample bookings
  const clients = await knex('users').where('role', 'client').select('id');
  const sessionTypesFromDb = await knex('session_types').select('id', 'trainer_id', 'duration_minutes', 'price');

  if (clients.length > 0 && sessionTypesFromDb.length > 0) {
    const sampleBookings = [];
    
    // Create a few sample bookings
    for (let i = 0; i < Math.min(3, clients.length); i++) {
      const sessionType = sessionTypesFromDb[i % sessionTypesFromDb.length];
      
      sampleBookings.push({
        id: knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"),
        client_id: clients[i].id,
        trainer_id: sessionType.trainer_id,
        session_type_id: sessionType.id,
        scheduled_at: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Next few days
        duration_minutes: sessionType.duration_minutes,
        session_format: i % 2 === 0 ? 'in_person' : 'online',
        location_details: i % 2 === 0 ? 'Main gym facility' : null,
        meeting_link: i % 2 === 1 ? 'https://meet.google.com/sample-link' : null,
        status: 'confirmed',
        confirmed_at: new Date(),
        total_amount: sessionType.price,
        platform_fee: sessionType.price * 0.1,
        trainer_payout: sessionType.price * 0.9,
        payment_status: 'paid',
        paid_at: new Date(),
        client_notes: `Looking forward to session ${i + 1}!`,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await knex('bookings').insert(sampleBookings);
  }

  console.log('✅ Booking system seed data created successfully');
  console.log(`   - Created ${sessionTypes.length} session types`);
  console.log(`   - Created ${availabilitySlots.length} availability slots`);
  console.log(`   - Created sample bookings`);
}; 