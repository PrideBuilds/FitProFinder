export const up = async (knex) => {
  await knex.schema.createTable('session_types', (table) => {
    // Primary key - using string for SQLite
    table.string('id', 36).primary().defaultTo(knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"));
    
    // Trainer reference
    table.string('trainer_id', 36).notNullable().references('user_id').inTable('trainer_profiles').onDelete('CASCADE');
    
    // Session information
    table.string('name', 100).notNullable();
    table.text('description');
    table.integer('duration_minutes').notNullable();
    table.decimal('price', 8, 2).notNullable();
    
    // Session type
    table.string('type').defaultTo('individual').checkIn(['individual', 'group', 'package']);
    table.integer('max_participants').defaultTo(1);
    table.integer('min_participants').defaultTo(1);
    
    // Package details (for package type)
    table.integer('session_count'); // for packages
    table.integer('validity_days'); // for packages
    
    // Availability
    table.boolean('is_active').defaultTo(true);
    table.boolean('allows_online').defaultTo(false);
    table.boolean('allows_in_person').defaultTo(true);
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['trainer_id']);
    table.index(['type']);
    table.index(['is_active']);
    table.index(['price']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('session_types');
}; 