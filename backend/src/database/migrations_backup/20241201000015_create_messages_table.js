export const up = async knex => {
  await knex.schema.createTable('messages', table => {
    // Primary key
    table.string('id', 36).primary();

    // Relationships
    table.string('conversation_id', 36).notNullable();
    table.string('sender_id', 36).notNullable();
    table.string('receiver_id', 36).notNullable();

    // Message content
    table.string('message_type', 20).defaultTo('text'); // text, image, file, system
    table.text('content'); // Message text content
    table.text('metadata'); // JSON for file info, image URLs, etc.

    // Message status
    table.string('status', 20).defaultTo('sent'); // sent, delivered, read, failed
    table.datetime('delivered_at');
    table.datetime('read_at');

    // Reply/thread support
    table.string('reply_to_message_id', 36); // For threaded conversations

    // File attachments
    table.string('file_url');
    table.string('file_name');
    table.string('file_type');
    table.integer('file_size');

    // Timestamps
    table.timestamps(true, true);

    // Foreign key constraints
    table
      .foreign('conversation_id')
      .references('id')
      .inTable('conversations')
      .onDelete('CASCADE');
    table
      .foreign('sender_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .foreign('receiver_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .foreign('reply_to_message_id')
      .references('id')
      .inTable('messages')
      .onDelete('SET NULL');

    // Indexes
    table.index(['conversation_id']);
    table.index(['sender_id']);
    table.index(['receiver_id']);
    table.index(['status']);
    table.index(['message_type']);
    table.index(['created_at']);
  });
};

export const down = async knex => {
  await knex.schema.dropTableIfExists('messages');
};
