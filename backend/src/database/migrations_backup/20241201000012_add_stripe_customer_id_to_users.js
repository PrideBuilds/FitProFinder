export const up = async knex => {
  await knex.schema.table('users', table => {
    table.string('stripe_customer_id').unique();
  });
};

export const down = async knex => {
  await knex.schema.table('users', table => {
    table.dropColumn('stripe_customer_id');
  });
};
