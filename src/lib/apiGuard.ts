import type { NextRequest } from 'next/server';
import { requireCapability } from '@/lib/authz';
import { verifyCsrf } from '@/lib/csrf';
import { rateLimitCheck, rateLimitKeyFromRequest } from '@/lib/rateLimit';
import { getTenantId, getActor } from '@/lib/tenant';
import { badRequest, forbidden } from '@/lib/apiResponse';

export interface GuardOptions {
  path: string; // identifier for rate limit key
  capability?: string; // capability to require (e.g., 'manage_team')
  rate?: { windowMs: number; max: number };
  csrf?: boolean; // enforce CSRF double submit
}

export function apiGuard(request: NextRequest, opts: GuardOptions):
  | { tenantId: string; actor: string; ip?: string }
  | Response {
  try {
    if (opts.capability) requireCapability(request, opts.capability);

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const tenantId = getTenantId(request);
    const actor = getActor(request);

    if (opts.rate) {
      const key = rateLimitKeyFromRequest({ ip, tenantId, path: opts.path });
      const rl = rateLimitCheck(key, opts.rate);
      if (!rl.allowed) return badRequest('Rate limit exceeded');
    }

    if (opts.csrf) verifyCsrf(request);

    return { tenantId, actor, ip };
  } catch (e: unknown) {
    const message = (typeof e === 'object' && e && 'message' in e) ? String((e as Error).message) : 'Forbidden';
    if (message === 'Forbidden') return forbidden(message);
    return badRequest(message);
  }
}
