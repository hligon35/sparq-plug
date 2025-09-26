import type { NextRequest } from 'next/server';
import { can } from '@/lib/roles';

class HttpError extends Error { constructor(message: string, public status = 400) { super(message); this.name = 'HttpError'; } }

export function getRole(req: NextRequest): string | null {
  // Prefer a gateway-provided header; else a cookie is handled by middleware for pages
  return req.headers.get('x-portal-role');
}

export function requireCapability(req: NextRequest, capability: string) {
  const role = getRole(req);
  if (!can(role, capability)) {
    throw new HttpError('Forbidden', 403);
  }
}
