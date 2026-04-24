import { describe, expect, it } from 'vitest';
import middleware from './middleware';
import { NextRequest } from 'next/server';
import { encrypt } from '@/lib/auth/session';

describe('Middleware RBAC Enforcement', () => {
  it('should allow Admin to access /api/admin/ping', async () => {
    const token = await encrypt({ userId: 'admin-id', role: 'Admin' });
    const req = new NextRequest('http://localhost/api/admin/ping', {
      headers: { cookie: `contentops_session=${token}` }
    });
    
    const res = await middleware(req);
    // Middleware returns undefined (continues) if authorized
    expect(res).toBeUndefined();
  });

  it('should block Creator from accessing /api/admin/ping', async () => {
    const token = await encrypt({ userId: 'creator-id', role: 'Creator' });
    const req = new NextRequest('http://localhost/api/admin/ping', {
      headers: { cookie: `contentops_session=${token}` }
    });
    
    const res = await middleware(req);
    expect(res?.status).toBe(403);
  });
});
