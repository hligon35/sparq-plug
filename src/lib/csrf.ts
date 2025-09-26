import type { NextRequest } from 'next/server';

class HttpError extends Error { constructor(message: string, public status = 400) { super(message); this.name = 'HttpError'; } }

/**
 * CSRF utilities: double-submit token pattern.
 * Reads a cookie named 'csrf-token' and expects matching 'x-csrf-token' header.
 * Controlled by env ENFORCE_CSRF ('true' to enforce).
 */
export function verifyCsrf(req: NextRequest) {
  if (process.env.ENFORCE_CSRF !== 'true') return; // opt-in enforcement
  const header = req.headers.get('x-csrf-token');
  const cookie = req.cookies.get('csrf-token')?.value;
  if (!header || !cookie || header !== cookie) {
    throw new HttpError('CSRF token mismatch', 403);
  }
}
