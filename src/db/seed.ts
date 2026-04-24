import Database from 'better-sqlite3';
import { SCHEMA } from '@/lib/db/schema';
import { env } from '@/lib/env';

// Stable UUIDs for demo users
export const DEMO_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'creator@contentops.local',
    role: 'Creator',
    display_name: 'Syndicate Creator',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'editor@contentops.local',
    role: 'Editor',
    display_name: 'Syndicate Editor',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'admin@contentops.local',
    role: 'Admin',
    display_name: 'Syndicate Admin',
  },
] as const;

export function runSeed(db: Database.Database) {
  // Initialize schema
  db.exec(SCHEMA);

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, role, display_name, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const now = Math.floor(Date.now() / 1000);

  for (const user of DEMO_USERS) {
    insertUser.run(user.id, user.email, user.role, user.display_name, now);
  }
}

// Execute if run directly
if (require.main === module) {
  const seedDb = new Database(env.CONTENTOPS_DB_PATH);
  console.log('Seeding database...');
  try {
    runSeed(seedDb);
    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    seedDb.close();
  }
}
