import Database from 'better-sqlite3';
import { env } from '@/lib/env';
import { SCHEMA } from './schema';

const db = new Database(env.CONTENTOPS_DB_PATH, {
  readonly: env.CONTENTOPS_DEMO_MODE,
});

// Enable WAL mode only in non-demo mode
if (!env.CONTENTOPS_DEMO_MODE) {
  db.pragma('journal_mode = WAL');
}

// Initialize schema on first connection
db.exec(SCHEMA);

export { db };
