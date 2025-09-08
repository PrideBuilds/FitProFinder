export const up = async knex => {
  await knex.schema.createTable('conversations', table => {
    // Primary key
    table.string('id', 36).primary();

    // Participants
    table.string('client_id', 36).notNullable();
    table.string('trainer_id', 36).notNullable();

    // Conversation metadata
    table.string('title', 255); // Optional custom title
    table.string('status', 20).defaultTo('active'); // active, archived, blocked
    table.text('last_message_preview');
    table.datetime('last_message_at');

    // Message counts and status
    table.integer('total_messages').defaultTo(0);
    table.integer('client_unread_count').defaultTo(0);
    table.integer('trainer_unread_count').defaultTo(0);

    // Timestamps
    table.timestamps(true, true);

    // Foreign key constraints
    table
      .foreign('client_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .foreign('trainer_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Indexes
    table.index(['client_id']);
    table.index(['trainer_id']);
    table.index(['status']);
    table.index(['last_message_at']);
    table.unique(['client_id', 'trainer_id']); // One conversation per client-trainer pair
  });
};

export const down = async knex => {
  await knex.schema.dropTableIfExists('conversations');
};
