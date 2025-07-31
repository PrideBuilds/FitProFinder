export const up = async (knex) => {
  await knex.schema.createTable('trainer_payouts', (table) => {
    table.string('id').primary();
    
    // Trainer relationship
    table.string('trainer_id').notNullable();
    table.foreign('trainer_id').references('id').inTable('users');
    
    // Payout Details
    table.string('payout_batch_id').unique().notNullable();
    table.decimal('total_amount', 10, 2).notNullable();
    table.integer('payment_count').notNullable(); // Number of payments in this payout
    table.string('currency', 3).defaultTo('USD');
    
    // Date Range
    table.date('period_start').notNullable();
    table.date('period_end').notNullable();
    
    // Status
    table.string('status').defaultTo('pending');
    
    // Payment Method
    table.string('payout_method').notNullable();
    
    // Bank/Payment Details
    table.text('payout_details'); // Bank account, PayPal email, etc.
    
    // Tracking
    table.string('external_payout_id'); // Stripe transfer ID, PayPal batch ID, etc.
    table.string('failure_reason');
    table.datetime('processed_at');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['trainer_id']);
    table.index(['status']);
    table.index(['period_start', 'period_end']);
    table.index(['created_at']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable('trainer_payouts');
}; 