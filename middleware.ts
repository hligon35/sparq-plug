import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { verifySession } from '@/lib/auth';

const ROLE_COOKIE = 'role';
const SSO_COOKIE = 'sparq_sso';

async function verifySsoCookie(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.SSO_JWT_SECRET || process.env.JWT_SECRET || 'email-admin-secret');
    const { payload } = await jwtVerify(token, secret);
    return payload as any;
  } catch {
    return null;
  }
}

function getRoleFromHeaderOrCookie(req: NextRequest) {
  const header = req.headers.get('x-portal-role');
  if (header) return header;
  const cookie = req.cookies.get(ROLE_COOKIE);
  if (cookie) return cookie.value;
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.nextUrl.hostname;
  const isDev = process.env.NODE_ENV === 'development' || hostname === 'localhost' || hostname === '127.0.0.1';
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const path = bp && pathname.startsWith(bp) ? pathname.slice(bp.length) || '/' : pathname;

  if (path === '/login' || path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')) {
    return NextResponse.next();
  }

  if (!(path.startsWith('/admin') || path.startsWith('/manager') || path.startsWith('/client'))) {
    return withSecurityHeaders(NextResponse.next());
  }

  const session = await verifySession(req.cookies.get('session')?.value);
  let role: string | null = session ? session.role : getRoleFromHeaderOrCookie(req);
  if (!role) {
    const sso = req.cookies.get(SSO_COOKIE)?.value;
    if (sso) {
      const claims = await verifySsoCookie(sso);
      role = (claims && (claims as any).role) || null;
    }
  }

  if (!role) return redirect(req, isDev);
  if (path.startsWith('/admin') && role !== 'admin') return redirect(req, isDev);
  if (path.startsWith('/manager') && role !== 'manager' && role !== 'admin') return redirect(req, isDev);
  if (path.startsWith('/client') && role !== 'client' && role !== 'admin' && role !== 'manager') return redirect(req, isDev);
  return withSecurityHeaders(NextResponse.next());
}

function redirect(req: NextRequest, _isDev: boolean) {
  // Always send unauthenticated users to local login (legacy external portal removed)
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/:path*'],
};

function withSecurityHeaders(res: NextResponse) {
  // Lightweight security headers (CSP intentionally relaxed placeholder)
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Basic CSP (adjust for analytics & external resources as needed)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // 'unsafe-inline' kept until inline scripts removed
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; ');
  res.headers.set('Content-Security-Policy', csp);
  return res;
}
