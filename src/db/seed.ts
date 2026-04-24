import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { env } from '@/lib/env';

// Bypass readonly check to explicitly open a writable connection for seeding
const seedDb = new Database(env.CONTENTOPS_DB_PATH);

console.log('Seeding database...');

seedDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Creator', 'Editor', 'Admin')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  )
`);

const insertUser = seedDb.prepare(`
  INSERT OR IGNORE INTO users (id, email, role)
  VALUES (?, ?, ?)
`);

const result = insertUser.run(
  crypto.randomUUID(),
  'admin@contentops.local',
  'Admin',
);

if (result.changes > 0) {
  console.log('Admin user seeded successfully.');
} else {
  console.log('Admin user already exists. Seed is idempotent.');
}

seedDb.close();
console.log('Database seeding complete.');
