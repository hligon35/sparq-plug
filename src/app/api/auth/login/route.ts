import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSession, buildSessionCookie, coerceRole } from '@/lib/auth';
import { rateLimitCheck, rateLimitKeyFromRequest, rateLimitHeaders } from '@/lib/rateLimit';
import { audit } from '@/lib/audit';
import { scheduleMaintenance } from '@/lib/maintenance';

export async function POST(req: NextRequest) {
  try {
    // Basic rate limiting (5 attempts / 2 min per IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const key = rateLimitKeyFromRequest({ ip, path: '/api/auth/login' });
    const limiterOpts = { windowMs: 120_000, max: 5 } as const;
    const limit = rateLimitCheck(key, limiterOpts);
    if (!limit.allowed) {
      const res = NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 });
      const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
      Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k,v));
      return res;
    }
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await audit({ actor: email, tenantId: 'system', action: 'auth.login.fail', target: 'user:unknown', metadata: { reason: 'not_found' } });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await audit({ actor: email, tenantId: 'system', action: 'auth.login.fail', target: `user:${user.id}`, metadata: { reason: 'bad_password' } });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  const role = coerceRole(user.role);
  const token = await signSession({ sub: user.id, role });
  const res = NextResponse.json({ ok: true, role });
    res.headers.set('Set-Cookie', buildSessionCookie(token));
    await audit({ actor: user.email, tenantId: 'system', action: 'auth.login.success', target: `user:${user.id}` });
  const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
  Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k,v));
  // background maintenance trigger (fire & forget)
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  scheduleMaintenance();
  return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}