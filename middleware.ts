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

  // Redirect /login to the login page we ship (or home) - keep URL stable
  if (pathname === '/login') {
    // Allow showing the login UI; but some portals might prefer redirecting to root
    return NextResponse.next();
  }

  // Protect admin/manager/client routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/manager') || pathname.startsWith('/client')) {
    const role = getRole(req);
    if (!role) {
      // Not authenticated/role unknown: redirect to login
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Role-based enforcement: allow admin for /admin, manager for /manager, client for /client
    if (pathname.startsWith('/admin') && role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/manager') && role !== 'manager' && role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith('/client') && role !== 'client' && role !== 'admin' && role !== 'manager') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/manager/:path*', '/client/:path*', '/login'],
};
