export const up = async (knex) => {
  await knex.schema.createTable('payment_methods', (table) => {
    table.string('id').primary();
    
    // User relationship
    table.string('user_id').notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Stripe Details
    table.string('stripe_payment_method_id').unique().notNullable();
    table.string('stripe_customer_id').notNullable();
    
    // Card Details (for display purposes)
    table.string('card_brand'); // visa, mastercard, etc.
    table.string('card_last_four', 4);
    table.integer('card_exp_month');
    table.integer('card_exp_year');
    table.string('card_country');
    
    // Billing Address
    table.string('billing_name');
    table.string('billing_email');
    table.string('billing_phone');
    table.string('billing_line1');
    table.string('billing_line2');
    table.string('billing_city');
    table.string('billing_state');
    table.string('billing_postal_code');
    table.string('billing_country');
    
    // Status
    table.boolean('is_default').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['stripe_customer_id']);
    table.index(['is_default']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable('payment_methods');
}; 