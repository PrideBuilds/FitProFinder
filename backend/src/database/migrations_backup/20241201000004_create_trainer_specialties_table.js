export const up = async (knex) => {
  await knex.schema.createTable('trainer_specialties', (table) => {
    // Composite primary key
    table.string('trainer_id', 36).notNullable().references('user_id').inTable('trainer_profiles').onDelete('CASCADE');
    table.integer('specialty_id').notNullable().references('id').inTable('specialties').onDelete('CASCADE');
    
    // Additional fields
    table.integer('experience_years').defaultTo(0);
    table.boolean('is_primary').defaultTo(false);
    table.text('notes');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Composite primary key
    table.primary(['trainer_id', 'specialty_id']);
    
    // Indexes
    table.index(['trainer_id']);
    table.index(['specialty_id']);
    table.index(['is_primary']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('trainer_specialties');
}; 