export const up = async knex => {
  await knex.schema.createTable('bookings', table => {
    // Primary key - using string for SQLite
    table
      .string('id', 36)
      .primary()
      .defaultTo(
        knex.raw(
          "(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))"
        )
      );

    // References
    table
      .string('client_id', 36)
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .string('trainer_id', 36)
      .notNullable()
      .references('user_id')
      .inTable('trainer_profiles')
      .onDelete('CASCADE');
    table
      .string('session_type_id', 36)
      .notNullable()
      .references('id')
      .inTable('session_types')
      .onDelete('CASCADE');

    // Booking details
    table.timestamp('scheduled_at').notNullable();
    table.integer('duration_minutes').notNullable();
    table
      .string('session_format')
      .defaultTo('in_person')
      .checkIn(['online', 'in_person']);
    table.text('location_details'); // for in-person sessions
    table.text('meeting_link'); // for online sessions

    // Status tracking
    table
      .string('status')
      .defaultTo('pending')
      .checkIn([
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'no_show',
      ]);
    table.timestamp('confirmed_at');
    table.timestamp('started_at');
    table.timestamp('completed_at');
    table.timestamp('cancelled_at');
    table.text('cancellation_reason');
    table.string('cancelled_by', 36); // user_id who cancelled

    // Pricing
    table.decimal('total_amount', 8, 2).notNullable();
    table.decimal('platform_fee', 8, 2).defaultTo(0);
    table.decimal('trainer_payout', 8, 2);

    // Payment tracking
    table
      .string('payment_status')
      .defaultTo('pending')
      .checkIn(['pending', 'paid', 'refunded', 'partially_refunded']);
    table.string('stripe_payment_intent_id');
    table.timestamp('paid_at');
    table.decimal('refund_amount', 8, 2).defaultTo(0);

    // Notes
    table.text('client_notes');
    table.text('trainer_notes');
    table.text('admin_notes');

    // Timestamps
    table.timestamps(true, true);

    // Indexes
    table.index(['client_id']);
    table.index(['trainer_id']);
    table.index(['status']);
    table.index(['payment_status']);
    table.index(['scheduled_at']);
    table.index(['created_at']);
    table.index(['stripe_payment_intent_id']);
  });
};

export const down = async knex => {
  await knex.schema.dropTableIfExists('bookings');
};
