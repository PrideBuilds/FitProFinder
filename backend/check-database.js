import knex from 'knex';
import config from './knexfile.js';

const db = knex(config.development);

async function checkDatabase() {
  try {
    console.log('Checking database contents...\n');
    
    // Check users
    const users = await db('users').select('id', 'email', 'first_name', 'last_name', 'role', 'is_verified');
    console.log('📋 Users:');
    users.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role} ${user.is_verified ? '✅' : '❌'}`);
    });
    
    // Check specialties
    const specialties = await db('specialties').select('name', 'description');
    console.log('\n🏋️  Specialties:');
    specialties.forEach(specialty => {
      console.log(`  - ${specialty.name}: ${specialty.description}`);
    });
    
    // Check trainer profiles
    const trainerProfiles = await db('trainer_profiles')
      .join('users', 'trainer_profiles.user_id', 'users.id')
      .select('users.first_name', 'users.last_name', 'trainer_profiles.location', 'trainer_profiles.hourly_rate', 'trainer_profiles.is_featured');
    console.log('\n👨‍💼 Trainer Profiles:');
    trainerProfiles.forEach(trainer => {
      console.log(`  - ${trainer.first_name} ${trainer.last_name} (${trainer.location}) - $${trainer.hourly_rate}/hr ${trainer.is_featured ? '⭐ Featured' : ''}`);
    });
    
    // Check trainer specialties
    const trainerSpecialties = await db('trainer_specialties')
      .join('trainer_profiles', 'trainer_specialties.trainer_id', 'trainer_profiles.id')
      .join('users', 'trainer_profiles.user_id', 'users.id')
      .join('specialties', 'trainer_specialties.specialty_id', 'specialties.id')
      .select('users.first_name', 'users.last_name', 'specialties.name as specialty');
    console.log('\n🎯 Trainer Specialties:');
    trainerSpecialties.forEach(ts => {
      console.log(`  - ${ts.first_name} ${ts.last_name}: ${ts.specialty}`);
    });
    
    // Check session types
    const sessionTypes = await db('session_types').select('name', 'duration_minutes', 'base_price');
    console.log('\n⏰ Session Types:');
    sessionTypes.forEach(session => {
      console.log(`  - ${session.name}: ${session.duration_minutes}min - $${session.base_price}`);
    });
    
    // Database stats
    const userCount = await db('users').count('* as count').first();
    const specialtyCount = await db('specialties').count('* as count').first();
    const trainerCount = await db('trainer_profiles').count('* as count').first();
    const sessionTypeCount = await db('session_types').count('* as count').first();
    
    console.log('\n📊 Database Statistics:');
    console.log(`  - Users: ${userCount.count}`);
    console.log(`  - Specialties: ${specialtyCount.count}`);
    console.log(`  - Trainer Profiles: ${trainerCount.count}`);
    console.log(`  - Session Types: ${sessionTypeCount.count}`);
    
    console.log('\n✅ Database setup and seeding completed successfully!');
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await db.destroy();
  }
}

checkDatabase(); 