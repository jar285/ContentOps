import Database from 'better-sqlite3';
import { describe, expect, it } from 'vitest';
import { DEMO_USERS, runSeed } from './seed';

describe('Database Seeding', () => {
  it('should seed three demo users with expected IDs and roles', () => {
    const db = new Database(':memory:');

    runSeed(db);

    const users = db.prepare('SELECT * FROM users').all() as any[];
    expect(users).toHaveLength(3);

    for (const expectedUser of DEMO_USERS) {
      const dbUser = users.find((u) => u.id === expectedUser.id);
      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(expectedUser.email);
      expect(dbUser.role).toBe(expectedUser.role);
      expect(dbUser.display_name).toBe(expectedUser.display_name);
    }
  });

  it('should be idempotent', () => {
    const db = new Database(':memory:');

    runSeed(db);
    const countFirst = db
      .prepare('SELECT count(*) as count FROM users')
      .get() as { count: number };

    runSeed(db);
    const countSecond = db
      .prepare('SELECT count(*) as count FROM users')
      .get() as { count: number };

    expect(countFirst.count).toBe(3);
    expect(countSecond.count).toBe(3);
  });
});
