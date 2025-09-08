export const up = async knex => {
  await knex.schema.createTable('availability_slots', table => {
    // Primary key
    table
      .string('id', 36)
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"
        )
      );

    // Trainer reference
    table
      .string('trainer_id', 36)
      .notNullable()
      .references('user_id')
      .inTable('trainer_profiles')
      .onDelete('CASCADE');

    // Time slot details
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').notNullable();
    table.string('day_of_week').notNullable(); // 'monday', 'tuesday', etc.

    // Slot type
    table
      .string('slot_type')
      .defaultTo('regular')
      .checkIn(['regular', 'exception', 'blocked']);

    // Recurring pattern
    table.boolean('is_recurring').defaultTo(true);
    table.date('recurrence_start_date');
    table.date('recurrence_end_date');
    table.text('recurrence_rule'); // RRULE format for complex recurrences

    // Booking constraints
    table.integer('max_bookings').defaultTo(1); // for group sessions
    table.integer('buffer_minutes_before').defaultTo(0);
    table.integer('buffer_minutes_after').defaultTo(0);

    // Status
    table.boolean('is_active').defaultTo(true);
    table.text('notes');

    // Google Calendar integration
    table.string('google_calendar_event_id');
    table.timestamp('last_synced_at');

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index(['trainer_id']);
    table.index(['start_time']);
    table.index(['end_time']);
    table.index(['day_of_week']);
    table.index(['slot_type']);
    table.index(['is_active']);
    table.index(['is_recurring']);
  });
};

export const down = async knex => {
  await knex.schema.dropTableIfExists('availability_slots');
};
