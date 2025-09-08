/**
 * Add Optimized Indexes Migration
 * Adds performance-optimized indexes for common queries
 */

export async function up(knex) {
  // Users table indexes
  await knex.schema.alterTable('users', (table) => {
    table.index('email', 'users_email_idx');
    table.index('role', 'users_role_idx');
    table.index('is_active', 'users_is_active_idx');
    table.index('is_verified', 'users_is_verified_idx');
    table.index('created_at', 'users_created_at_idx');
    table.index(['role', 'is_active'], 'users_role_active_idx');
  });

  // Trainer profiles indexes
  await knex.schema.alterTable('trainer_profiles', (table) => {
    table.index('is_accepting_clients', 'trainer_profiles_accepting_idx');
    table.index('is_featured', 'trainer_profiles_featured_idx');
    table.index('rating', 'trainer_profiles_rating_idx');
    table.index(['city', 'state'], 'trainer_profiles_location_idx');
    table.index('hourly_rate', 'trainer_profiles_rate_idx');
    table.index(['rating', 'is_accepting_clients'], 'trainer_profiles_rating_accepting_idx');
  });

  // Bookings indexes
  await knex.schema.alterTable('bookings', (table) => {
    table.index('client_id', 'bookings_client_idx');
    table.index('trainer_id', 'bookings_trainer_idx');
    table.index('status', 'bookings_status_idx');
    table.index('scheduled_date', 'bookings_scheduled_date_idx');
    table.index(['client_id', 'status'], 'bookings_client_status_idx');
    table.index(['trainer_id', 'status'], 'bookings_trainer_status_idx');
    table.index(['scheduled_date', 'status'], 'bookings_date_status_idx');
  });

  // Messages indexes
  await knex.schema.alterTable('messages', (table) => {
    table.index('conversation_id', 'messages_conversation_idx');
    table.index('sender_id', 'messages_sender_idx');
    table.index('created_at', 'messages_created_at_idx');
    table.index(['conversation_id', 'created_at'], 'messages_conversation_date_idx');
    table.index(['sender_id', 'created_at'], 'messages_sender_date_idx');
  });

  // Conversations indexes
  await knex.schema.alterTable('conversations', (table) => {
    table.index('client_id', 'conversations_client_idx');
    table.index('trainer_id', 'conversations_trainer_idx');
    table.index('updated_at', 'conversations_updated_at_idx');
    table.index(['client_id', 'updated_at'], 'conversations_client_updated_idx');
    table.index(['trainer_id', 'updated_at'], 'conversations_trainer_updated_idx');
  });

  // Payments indexes
  await knex.schema.alterTable('payments', (table) => {
    table.index('user_id', 'payments_user_idx');
    table.index('booking_id', 'payments_booking_idx');
    table.index('status', 'payments_status_idx');
    table.index('created_at', 'payments_created_at_idx');
    table.index(['user_id', 'status'], 'payments_user_status_idx');
    table.index(['created_at', 'status'], 'payments_date_status_idx');
  });

  // Reviews indexes
  await knex.schema.alterTable('reviews', (table) => {
    table.index('trainer_id', 'reviews_trainer_idx');
    table.index('client_id', 'reviews_client_idx');
    table.index('rating', 'reviews_rating_idx');
    table.index('created_at', 'reviews_created_at_idx');
    table.index(['trainer_id', 'rating'], 'reviews_trainer_rating_idx');
  });

  // Trainer specialties indexes
  await knex.schema.alterTable('trainer_specialties', (table) => {
    table.index('trainer_id', 'trainer_specialties_trainer_idx');
    table.index('specialty_id', 'trainer_specialties_specialty_idx');
    table.index(['trainer_id', 'specialty_id'], 'trainer_specialties_trainer_specialty_idx');
  });

  // Session types indexes
  await knex.schema.alterTable('session_types', (table) => {
    table.index('trainer_id', 'session_types_trainer_idx');
    table.index('is_active', 'session_types_active_idx');
    table.index(['trainer_id', 'is_active'], 'session_types_trainer_active_idx');
  });

  // Availability slots indexes
  await knex.schema.alterTable('availability_slots', (table) => {
    table.index('trainer_id', 'availability_slots_trainer_idx');
    table.index('day_of_week', 'availability_slots_day_idx');
    table.index('is_available', 'availability_slots_available_idx');
    table.index(['trainer_id', 'day_of_week'], 'availability_slots_trainer_day_idx');
  });

  // Notifications indexes
  await knex.schema.alterTable('notifications', (table) => {
    table.index('user_id', 'notifications_user_idx');
    table.index('type', 'notifications_type_idx');
    table.index('is_read', 'notifications_read_idx');
    table.index('created_at', 'notifications_created_at_idx');
    table.index(['user_id', 'is_read'], 'notifications_user_read_idx');
  });
}

export async function down(knex) {
  // Drop all indexes
  const indexes = [
    'users_email_idx',
    'users_role_idx',
    'users_is_active_idx',
    'users_is_verified_idx',
    'users_created_at_idx',
    'users_role_active_idx',
    'trainer_profiles_accepting_idx',
    'trainer_profiles_featured_idx',
    'trainer_profiles_rating_idx',
    'trainer_profiles_location_idx',
    'trainer_profiles_rate_idx',
    'trainer_profiles_rating_accepting_idx',
    'bookings_client_idx',
    'bookings_trainer_idx',
    'bookings_status_idx',
    'bookings_scheduled_date_idx',
    'bookings_client_status_idx',
    'bookings_trainer_status_idx',
    'bookings_date_status_idx',
    'messages_conversation_idx',
    'messages_sender_idx',
    'messages_created_at_idx',
    'messages_conversation_date_idx',
    'messages_sender_date_idx',
    'conversations_client_idx',
    'conversations_trainer_idx',
    'conversations_updated_at_idx',
    'conversations_client_updated_idx',
    'conversations_trainer_updated_idx',
    'payments_user_idx',
    'payments_booking_idx',
    'payments_status_idx',
    'payments_created_at_idx',
    'payments_user_status_idx',
    'payments_date_status_idx',
    'reviews_trainer_idx',
    'reviews_client_idx',
    'reviews_rating_idx',
    'reviews_created_at_idx',
    'reviews_trainer_rating_idx',
    'trainer_specialties_trainer_idx',
    'trainer_specialties_specialty_idx',
    'trainer_specialties_trainer_specialty_idx',
    'session_types_trainer_idx',
    'session_types_active_idx',
    'session_types_trainer_active_idx',
    'availability_slots_trainer_idx',
    'availability_slots_day_idx',
    'availability_slots_available_idx',
    'availability_slots_trainer_day_idx',
    'notifications_user_idx',
    'notifications_type_idx',
    'notifications_read_idx',
    'notifications_created_at_idx',
    'notifications_user_read_idx',
  ];

  for (const indexName of indexes) {
    try {
      await knex.raw(`DROP INDEX IF EXISTS ${indexName}`);
    } catch (error) {
      console.warn(`Failed to drop index ${indexName}:`, error.message);
    }
  }
}
