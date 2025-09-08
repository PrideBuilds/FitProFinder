export const up = async knex => {
  await knex.schema.createTable('specialties', table => {
    // Primary key
    table.increments('id').primary();

    // Specialty information
    table.string('name', 100).notNullable().unique();
    table.string('slug', 100).notNullable().unique();
    table.text('description');
    table.string('icon_name', 50);
    table.string('color', 20);
    table.string('image_url', 500);

    // Status
    table.boolean('is_active').defaultTo(true);
    table.integer('sort_order').defaultTo(0);

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index(['slug']);
    table.index(['is_active']);
    table.index(['sort_order']);
  });
};

export const down = async knex => {
  await knex.schema.dropTableIfExists('specialties');
};
