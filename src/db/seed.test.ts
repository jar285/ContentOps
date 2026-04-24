import { describe, expect, it } from 'vitest';
import { db } from '@/lib/db';

describe('Database Seed Verification', () => {
  it('should have the three exact stable demo UUIDs', () => {
    const users = db.prepare('SELECT id, role, display_name FROM users ORDER BY id ASC').all() as any[];
    
    expect(users).toHaveLength(3);
    
    // Creator
    expect(users[0]).toEqual({
      id: '00000000-0000-0000-0000-000000000001',
      role: 'Creator',
      display_name: 'Syndicate Creator'
    });
    
    // Editor
    expect(users[1]).toEqual({
      id: '00000000-0000-0000-0000-000000000002',
      role: 'Editor',
      display_name: 'Syndicate Editor'
    });
    
    // Admin
    expect(users[2]).toEqual({
      id: '00000000-0000-0000-0000-000000000003',
      role: 'Admin',
      display_name: 'Syndicate Admin'
    });
  });
});
