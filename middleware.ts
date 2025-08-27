import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROLE_COOKIE = 'role';

function getRole(req: NextRequest) {
  // Prefer a header (for integration with external portal), then cookie
  const header = req.headers.get('x-portal-role');
  if (header) return header;
  const cookie = req.cookies.get(ROLE_COOKIE);
  if (cookie) return cookie.value;
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const path = bp && pathname.startsWith(bp) ? pathname.slice(bp.length) || '/' : pathname;

  // Allow the login page to render freely
  if (path === '/login') {
    return NextResponse.next();
  }

  // Protect admin/manager/client routes
  if (path.startsWith('/admin') || path.startsWith('/manager') || path.startsWith('/client')) {
    const role = getRole(req);
    if (!role) {
      // Not authenticated/role unknown: redirect to login
      const url = req.nextUrl.clone();
      url.pathname = `${bp}/login`;
      return NextResponse.redirect(url);
    }

    // Role-based enforcement: allow admin for /admin, manager for /manager, client for /client
    if (path.startsWith('/admin') && role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = `${bp}/login`;
      return NextResponse.redirect(url);
    }
    if (path.startsWith('/manager') && role !== 'manager' && role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = `${bp}/login`;
      return NextResponse.redirect(url);
    }
    if (path.startsWith('/client') && role !== 'client' && role !== 'admin' && role !== 'manager') {
      const url = req.nextUrl.clone();
      url.pathname = `${bp}/login`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
