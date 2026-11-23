import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { pool } from '../server/db';

if (!pool) {
  console.error('DATABASE_URL is missing. Copy .env.example to .env and configure it first.');
  process.exit(1);
}

try {
  const sql = await readFile(new URL('../db/migrations/001_initial_schema.sql', import.meta.url), 'utf8');
  await pool.query(sql);
  console.log('NPCverse database schema applied successfully.');
} catch (error) {
  console.error('Database migration failed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
