import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSession, buildSessionCookie } from '@/lib/auth';
import { rateLimitCheck, rateLimitKeyFromRequest } from '@/lib/rateLimit';
import { audit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    // Basic rate limiting (5 attempts / 2 min per IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const key = rateLimitKeyFromRequest({ ip, path: '/api/auth/login' });
    const limit = rateLimitCheck(key, { windowMs: 120_000, max: 5 });
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 });
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
    const token = await signSession({ sub: user.id, role: user.role });
    const res = NextResponse.json({ ok: true, role: user.role });
    res.headers.set('Set-Cookie', buildSessionCookie(token));
    await audit({ actor: user.email, tenantId: 'system', action: 'auth.login.success', target: `user:${user.id}` });
    return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}