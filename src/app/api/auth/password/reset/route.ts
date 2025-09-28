import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, passwordResetSuccessTemplate } from '@/lib/email';
import { rateLimitCheck, rateLimitKeyFromRequest, rateLimitHeaders } from '@/lib/rateLimit';
import { evaluatePassword } from '@/lib';
import { audit } from '@/lib/audit';
import { scheduleMaintenance } from '@/lib/maintenance';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const limiterOpts = { windowMs: 15 * 60_000, max: 10 } as const;
    const key = rateLimitKeyFromRequest({ ip, path: '/api/auth/password/reset' });
    const limit = rateLimitCheck(key, limiterOpts);
    if (!limit.allowed) {
      const r = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
      Object.entries(hdrs).forEach(([k,v]) => r.headers.set(k,v));
      return r;
    }
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    const pwEval = evaluatePassword(password);
    if (!pwEval.ok) return NextResponse.json({ error: 'Weak password', details: pwEval.errors }, { status: 400 });
    const hash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await prisma.passwordResetToken.findFirst({ where: { tokenHash: hash, usedAt: null, expiresAt: { gt: new Date() } } });
    if (!record) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    const newHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash: newHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
    ]);
    const user = await prisma.user.findUnique({ where: { id: record.userId } });
    if (user) {
      await sendEmail({ to: user.email, subject: 'Your password was changed', html: passwordResetSuccessTemplate(), template: 'password-reset-success' });
      await audit({ actor: user.email, tenantId: 'system', action: 'auth.password.reset.complete', target: `user:${user.id}` });
    }
  const res = NextResponse.json({ ok: true });
  const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
  Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k,v));
  return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
