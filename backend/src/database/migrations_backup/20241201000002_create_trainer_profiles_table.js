export const up = async (knex) => {
  await knex.schema.createTable('trainer_profiles', (table) => {
    // Primary key linked to users table
    table.string('user_id', 36).primary().references('id').inTable('users').onDelete('CASCADE');
    
    // Business information
    table.string('business_name', 255);
    table.text('bio').notNullable();
    table.integer('experience_years').notNullable().defaultTo(0);
    
    // Location information
    table.string('address', 500).notNullable();
    table.string('city', 100).notNullable();
    table.string('state', 50).notNullable();
    table.string('zip_code', 20).notNullable();
    table.string('country', 10).notNullable().defaultTo('US');
    table.decimal('latitude', 10, 8);
    table.decimal('longitude', 11, 8);
    
    // Professional status
    table.decimal('rating', 3, 2).defaultTo(0);
    table.integer('review_count').defaultTo(0);
    table.boolean('is_verified').defaultTo(false);
    table.string('subscription_tier', 20).defaultTo('free');
    
    // Social links (JSON as text for SQLite)
    table.text('social_links');
    
    // Availability status
    table.boolean('is_accepting_clients').defaultTo(true);
    table.boolean('offers_online_sessions').defaultTo(false);
    table.boolean('offers_in_person_sessions').defaultTo(true);
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['city', 'state']);
    table.index(['zip_code']);
    table.index(['rating']);
    table.index(['is_verified']);
    table.index(['subscription_tier']);
    table.index(['is_accepting_clients']);
    table.index(['latitude', 'longitude']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('trainer_profiles');
}; 