export const up = async (knex) => {
  await knex.schema.createTable('calendar_integrations', (table) => {
    // Primary key
    table.string('id', 36).primary().defaultTo(knex.raw("(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"));
    
    // Trainer reference
    table.string('trainer_id', 36).notNullable().references('user_id').inTable('trainer_profiles').onDelete('CASCADE');
    
    // Integration details
    table.string('provider').notNullable(); // 'google', 'outlook', etc.
    table.string('calendar_id').notNullable();
    table.string('calendar_name');
    
    // OAuth credentials (encrypted)
    table.text('access_token'); // Should be encrypted in production
    table.text('refresh_token'); // Should be encrypted in production
    table.timestamp('token_expires_at');
    table.text('scope');
    
    // Sync settings
    table.boolean('auto_sync_enabled').defaultTo(true);
    table.boolean('create_events_in_external').defaultTo(true);
    table.boolean('import_events_from_external').defaultTo(false);
    table.integer('sync_interval_minutes').defaultTo(15);
    table.timestamp('last_sync_at');
    table.text('last_sync_status'); // 'success', 'error', 'partial'
    table.text('last_sync_error');
    
    // Event creation settings
    table.string('event_title_template').defaultTo('FitProFinder Session - {client_name}');
    table.text('event_description_template');
    table.boolean('include_client_contact').defaultTo(false);
    table.string('event_visibility').defaultTo('private'); // 'public', 'private'
    
    // Status
    table.boolean('is_active').defaultTo(true);
    table.timestamp('connected_at');
    table.timestamp('disconnected_at');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['trainer_id']);
    table.index(['provider']);
    table.index(['is_active']);
    table.index(['last_sync_at']);
    
    // Unique constraint
    table.unique(['trainer_id', 'provider', 'calendar_id']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('calendar_integrations');
}; 