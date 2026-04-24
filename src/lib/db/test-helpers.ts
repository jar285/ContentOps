import Database from 'better-sqlite3';
import { SCHEMA } from './schema';

/**
 * Creates a fresh in-memory database with the current schema.
 * Useful for unit and integration tests to avoid side effects.
 */
export function createTestDb() {
  const db = new Database(':memory:');
  db.exec(SCHEMA);
  return db;
}
