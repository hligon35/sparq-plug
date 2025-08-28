import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

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
  // Prefer a header (for integration with external portal), then cookie
  const header = req.headers.get('x-portal-role');
  if (header) return header;
  const cookie = req.cookies.get(ROLE_COOKIE);
  if (cookie) return cookie.value;
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const path = bp && pathname.startsWith(bp) ? pathname.slice(bp.length) || '/' : pathname;

  // Allow health/version and Next static without auth interference
  if (path === '/api/version' || path === '/_next' || path.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Allow the login page to render freely
  if (path === '/login') {
    return NextResponse.next();
  }

  // Protect admin/manager/client routes
  if (path.startsWith('/admin') || path.startsWith('/manager') || path.startsWith('/client')) {
    let role = getRoleFromHeaderOrCookie(req);
    // If no role cookie, try verifying SSO cookie JWT for role
    if (!role) {
      const sso = req.cookies.get(SSO_COOKIE)?.value;
      if (sso) {
        const claims = await verifySsoCookie(sso);
        role = (claims && (claims as any).role) || null;
      }
    }
    if (!role) {
      // Not authenticated/role unknown: redirect to portal login with returnTo
      const currentUrl = req.nextUrl.clone();
      const rt = encodeURIComponent(currentUrl.toString());
      const target = `https://portal.getsparqd.com/login.html?rt=${rt}`;
      return NextResponse.redirect(target);
    }

    // Role-based enforcement: allow admin for /admin, manager for /manager, client for /client
    if (path.startsWith('/admin') && role !== 'admin') {
      const currentUrl = req.nextUrl.clone();
      const rt = encodeURIComponent(currentUrl.toString());
      const target = `https://portal.getsparqd.com/login.html?rt=${rt}`;
      return NextResponse.redirect(target);
    }
    if (path.startsWith('/manager') && role !== 'manager' && role !== 'admin') {
      const currentUrl = req.nextUrl.clone();
      const rt = encodeURIComponent(currentUrl.toString());
      const target = `https://portal.getsparqd.com/login.html?rt=${rt}`;
      return NextResponse.redirect(target);
    }
    if (path.startsWith('/client') && role !== 'client' && role !== 'admin' && role !== 'manager') {
      const currentUrl = req.nextUrl.clone();
      const rt = encodeURIComponent(currentUrl.toString());
      const target = `https://portal.getsparqd.com/login.html?rt=${rt}`;
      return NextResponse.redirect(target);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
