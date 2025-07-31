export const up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    // Primary key - use string for SQLite compatibility
    table.string('id', 36).primary();
    
    // Basic user info
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('role', 20).notNullable().defaultTo('client');
    table.string('phone_number', 20);
    table.text('profile_image_url');
    
    // Verification & status
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('email_verified_at');
    
    // Authentication tokens
    table.string('email_verification_token');
    table.string('password_reset_token');
    table.timestamp('password_reset_expires');
    
    // Last login tracking
    table.timestamp('last_login_at');
    table.string('last_login_ip', 45);
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['role']);
    table.index(['is_active']);
    table.index(['created_at']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('users');
}; 