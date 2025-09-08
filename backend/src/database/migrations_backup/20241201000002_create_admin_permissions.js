export const up = async knex => {
  // Create admin permissions table
  await knex.schema.createTable('admin_permissions', table => {
    table.string('id', 36).primary();
    table.string('user_id', 36).notNullable();
    table.string('permission_level', 20).notNullable(); // super_admin, admin, moderator
    table.json('permissions').notNullable(); // JSON object with specific permissions
    table.string('granted_by', 36); // ID of the admin who granted these permissions
    table.timestamp('granted_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at'); // Optional expiration
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    // Foreign keys
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .foreign('granted_by')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    // Indexes
    table.index(['user_id']);
    table.index(['permission_level']);
    table.index(['is_active']);
  });

  // Create admin activity log
  await knex.schema.createTable('admin_activity_log', table => {
    table.string('id', 36).primary();
    table.string('admin_id', 36).notNullable();
    table.string('action', 100).notNullable(); // e.g., 'user_created', 'user_deleted', 'permissions_granted'
    table.string('target_type', 50); // e.g., 'user', 'admin', 'system'
    table.string('target_id', 36); // ID of the affected resource
    table.json('details'); // JSON with action details
    table.string('ip_address', 45);
    table.text('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Foreign keys
    table
      .foreign('admin_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Indexes
    table.index(['admin_id']);
    table.index(['action']);
    table.index(['created_at']);
    table.index(['target_type', 'target_id']);
  });

  // Update users table to add admin-specific fields
  await knex.schema.table('users', table => {
    table.timestamp('admin_since'); // When they became an admin
    table.string('admin_level', 20); // super_admin, admin, moderator, null
    table.json('admin_notes'); // Internal notes about this user
  });
};

export const down = async knex => {
  await knex.schema.table('users', table => {
    table.dropColumn('admin_since');
    table.dropColumn('admin_level');
    table.dropColumn('admin_notes');
  });

  await knex.schema.dropTableIfExists('admin_activity_log');
  await knex.schema.dropTableIfExists('admin_permissions');
};
