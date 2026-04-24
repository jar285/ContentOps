import { NextRequest, NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_USERS } from '@/lib/auth/constants';
import { decrypt, encrypt } from '@/lib/auth/session';
import { middleware } from './middleware';

vi.mock('@/lib/auth/session', () => ({
  decrypt: vi.fn(),
  encrypt: vi.fn(),
}));

describe('RBAC Middleware', () => {
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow unprotected routes to pass through without session check', async () => {
    const request = new NextRequest(new URL('/any-other-path', baseUrl));
    const response = await middleware(request);

    expect(response?.status).toBe(200);
    expect(decrypt).not.toHaveBeenCalled();
  });

  it('should fallback to creator-1 for missing cookies on protected routes', async () => {
    const request = new NextRequest(new URL('/api/chat', baseUrl));
    const creatorUser = DEMO_USERS.find((u) => u.role === 'Creator');

    vi.mocked(encrypt).mockResolvedValue('mock-token');

    const response = await middleware(request);

    expect(response?.status).toBe(200);
    expect(response?.cookies.get('contentops_session')?.value).toBe(
      'mock-token',
    );
    expect(encrypt).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: creatorUser?.id,
        role: 'Creator',
      }),
    );
  });

  it('should allow Admin to access /api/admin routes', async () => {
    const request = new NextRequest(new URL('/api/admin/ping', baseUrl));
    request.cookies.set('contentops_session', 'admin-token');

    vi.mocked(decrypt).mockResolvedValue({
      userId: 'admin-id',
      role: 'Admin',
      displayName: 'Admin User',
    });

    const response = await middleware(request);
    expect(response?.status).toBe(200);
  });

  it('should deny Creator from accessing /api/admin routes', async () => {
    const request = new NextRequest(new URL('/api/admin/ping', baseUrl));
    request.cookies.set('contentops_session', 'creator-token');

    vi.mocked(decrypt).mockResolvedValue({
      userId: 'creator-id',
      role: 'Creator',
      displayName: 'Creator User',
    });

    const response = await middleware(request);
    expect(response?.status).toBe(403);

    const body = await response?.json();
    expect(body.error).toBe('Forbidden');
  });

  it('should fallback to creator-1 for expired tokens', async () => {
    const request = new NextRequest(new URL('/api/chat', baseUrl));
    request.cookies.set('contentops_session', 'expired-token');

    vi.mocked(decrypt).mockResolvedValue(null); // Decrypt returns null for expired/invalid
    vi.mocked(encrypt).mockResolvedValue('new-token');

    const response = await middleware(request);

    expect(response?.status).toBe(200);
    expect(response?.cookies.get('contentops_session')?.value).toBe(
      'new-token',
    );
  });
});
