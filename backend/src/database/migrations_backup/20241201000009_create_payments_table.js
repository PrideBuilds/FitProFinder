export const up = async (knex) => {
  await knex.schema.createTable('payments', (table) => {
    table.string('id').primary();
    
    // Relationships
    table.string('booking_id').notNullable();
    table.foreign('booking_id').references('id').inTable('bookings').onDelete('CASCADE');
    table.string('client_id').notNullable();
    table.foreign('client_id').references('id').inTable('users');
    table.string('trainer_id').notNullable();
    table.foreign('trainer_id').references('id').inTable('users');
    
    // Payment Details
    table.string('stripe_payment_intent_id').unique();
    table.string('stripe_payment_method_id');
    table.decimal('amount', 10, 2).notNullable(); // Total amount charged
    table.decimal('platform_fee', 10, 2).notNullable(); // FitProFinder's fee
    table.decimal('trainer_amount', 10, 2).notNullable(); // Amount trainer receives
    table.string('currency', 3).defaultTo('USD');
    
    // Payment Status
    table.string('status').defaultTo('pending');
    
    // Payment Method Info
    table.text('payment_method_details'); // Card info, billing address, etc.
    table.string('receipt_url');
    table.string('failure_reason');
    
    // Refund Information
    table.decimal('refunded_amount', 10, 2).defaultTo(0);
    table.string('refund_reason');
    table.datetime('refunded_at');
    
    // Payout Information
    table.boolean('trainer_paid').defaultTo(false);
    table.datetime('trainer_paid_at');
    table.string('payout_batch_id');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['booking_id']);
    table.index(['client_id']);
    table.index(['trainer_id']);
    table.index(['status']);
    table.index(['created_at']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable('payments');
}; 