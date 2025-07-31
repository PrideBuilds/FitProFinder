export const up = async (knex) => {
  await knex.schema.createTable('message_attachments', (table) => {
    // Primary key
    table.string('id', 36).primary();
    
    // Relationships
    table.string('message_id', 36).notNullable();
    
    // File information
    table.string('file_url').notNullable();
    table.string('file_name').notNullable();
    table.string('file_type').notNullable(); // image/jpeg, application/pdf, etc.
    table.integer('file_size').notNullable(); // in bytes
    table.string('mime_type');
    
    // Image-specific metadata
    table.integer('image_width');
    table.integer('image_height');
    table.string('thumbnail_url');
    
    // Upload information
    table.string('upload_status', 20).defaultTo('uploading'); // uploading, completed, failed
    table.text('upload_error');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Foreign key constraints
    table.foreign('message_id').references('id').inTable('messages').onDelete('CASCADE');
    
    // Indexes
    table.index(['message_id']);
    table.index(['file_type']);
    table.index(['upload_status']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('message_attachments');
}; 