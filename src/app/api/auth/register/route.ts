import { NextRequest, NextResponse } from 'next/server';
import { evaluatePassword } from '@/lib/passwordPolicy';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimitCheck, rateLimitKeyFromRequest, rateLimitHeaders } from '@/lib/rateLimit';
import { audit } from '@/lib/audit';
import { scheduleMaintenance } from '@/lib/maintenance';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const key = rateLimitKeyFromRequest({ ip, path: '/api/auth/register' });
    const limit = rateLimitCheck(key, { windowMs: 10 * 60_000, max: 8 });
    if (!limit.allowed) {
      const res = NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
      const hdrs = rateLimitHeaders(limit.remaining, { windowMs: 10 * 60_000, max: 8 });
      Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k, v));
      return res;
    }
    const body = await req.json();
    const { email, password, name, role, company } = body || {};
    if (!email || !password || !role) {
      await audit({ actor: email || 'unknown', tenantId: 'system', action: 'auth.register.invalid', target: 'registration', metadata: { reason: 'missing_fields' } });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const pwEval = evaluatePassword(password);
    if (!pwEval.ok) {
      await audit({ actor: email, tenantId: 'system', action: 'auth.register.weak_password', target: 'registration', metadata: { errors: pwEval.errors } });
      return NextResponse.json({ error: 'Weak password', details: pwEval.errors }, { status: 400 });
    }
    const existsUser = await prisma.user.findUnique({ where: { email } });
    const existingPending = await prisma.registrationRequest.findFirst({ where: { email, status: 'pending' } });
    if (existsUser) {
      await audit({ actor: email, tenantId: 'system', action: 'auth.register.conflict', target: `user:${existsUser.id}` });
      return NextResponse.json({ error: 'Account already exists' }, { status: 409 });
    }
    if (existingPending) {
      await audit({ actor: email, tenantId: 'system', action: 'auth.register.duplicate_pending', target: `registration:${existingPending.id}` });
      return NextResponse.json({ error: 'A pending request already exists' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.registrationRequest.create({ data: { email, name, company, roleRequested: role, passwordHash } });
    await audit({ actor: email, tenantId: 'system', action: 'auth.register.request', target: `registration:${created.id}`, metadata: { role } });
  const res = NextResponse.json({ ok: true, message: 'Registration submitted for approval' });
  const hdrs = rateLimitHeaders(limit.remaining, { windowMs: 10 * 60_000, max: 8 });
  Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k, v));
  // periodic cleanup
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  scheduleMaintenance();
  return res;
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
