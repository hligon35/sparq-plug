import { NextRequest, NextResponse } from 'next/server';
import { signSession, verifySession } from './lib/auth';

// Map gateway header -> session cookie if absent. Keeps cookie lifespan short.
// Shorter expiration improves security (override default 7d via custom sign here).
const SESSION_COOKIE = 'session';
const MAX_AGE_SECONDS = 60 * 60 * 4; // 4 hours

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // Skip static assets and Next internals
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/assets') || url.pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  let payload = await verifySession(cookie);
  if (!payload) {
    const portalUser = req.headers.get('x-portal-user');
    if (portalUser) {
      try {
        const decoded = JSON.parse(Buffer.from(portalUser, 'base64').toString('utf-8')) as { username?: string; role?: string };
        if (decoded && decoded.username && decoded.role) {
          const token = await signSession({ sub: decoded.username, role: decoded.role as any }, `${MAX_AGE_SECONDS}s`);
          const res = NextResponse.next();
          res.cookies.set({
            name: SESSION_COOKIE,
            value: token,
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: MAX_AGE_SECONDS,
          });
          return res;
        }
      } catch { /* ignore malformed header */ }
    }
  }

  // Protect role areas
  const protectedPrefixes = ['/admin', '/manager', '/client'];
  if (protectedPrefixes.some(p => url.pathname === p || url.pathname.startsWith(p + '/'))) {
    if (!payload) {
      // Redirect to static gateway login page
      const login = '/app/login.html';
      const res = NextResponse.redirect(new URL(login, req.url));
      res.headers.set('x-auth-redirect', '1');
      return res;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/healthz).*)'],
};
