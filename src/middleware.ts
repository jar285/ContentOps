import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { DEMO_USERS } from '@/lib/auth/constants';
import { decrypt, encrypt } from '@/lib/auth/session';

const PROTECTED_PREFIXES = ['/api/admin', '/api/chat', '/api/conversations'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip if not a protected route
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  // 2. Extract and verify session
  const cookie = request.cookies.get('contentops_session');
  let session = cookie ? await decrypt(cookie.value) : null;

  const response = NextResponse.next();

  // 3. Fallback logic for missing/invalid/expired cookies
  if (!session) {
    const creatorUser = DEMO_USERS.find((u) => u.role === 'Creator');
    if (creatorUser) {
      session = {
        userId: creatorUser.id,
        role: creatorUser.role,
        displayName: creatorUser.display_name,
      };
      // Persist the default session for anonymous visitors
      const token = await encrypt(session);
      response.cookies.set('contentops_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }
  }

  // 4. Role-based Authorization
  if (session) {
    // Admin routes
    if (pathname.startsWith('/api/admin') && session.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // /api/chat and /api/conversations: all authenticated roles allowed
  } else {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
