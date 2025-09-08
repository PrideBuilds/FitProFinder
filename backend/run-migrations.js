import knex from 'knex';
import config from './knexfile.js';

const db = knex(config.development);

async function runMigrations() {
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await db.destroy();
  }
}

runMigrations();
