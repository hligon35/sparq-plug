import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail, passwordResetTemplate } from '@/lib/email';
import { rateLimitCheck, rateLimitKeyFromRequest, rateLimitHeaders } from '@/lib/rateLimit';
import { audit } from '@/lib/audit';
import { scheduleMaintenance } from '@/lib/maintenance';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const key = rateLimitKeyFromRequest({ ip, path: '/api/auth/password/reset-request' });
    const limiterOpts = { windowMs: 15 * 60_000, max: 5 } as const;
    const limit = rateLimitCheck(key, limiterOpts);
    if (!limit.allowed) {
      const res = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
      Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k,v));
      return res;
    }
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond success to avoid user enumeration
    if (!user) {
      // Log anonymized request to detect enumeration attempts volume, but don't reveal absence
      await audit({ actor: email, tenantId: 'system', action: 'auth.password.reset.request.unknown', target: 'user:unknown' });
      const res = NextResponse.json({ ok: true });
      const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
      Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k,v));
      return res;
    }
    const raw = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hash, expiresAt: expires } });
    const base = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const link = `${base}/reset-password?token=${raw}`;
    await sendEmail({ to: user.email, subject: 'Reset your password', html: passwordResetTemplate(link), template: 'password-reset-request' });
    const debugMode = process.env.RESET_TOKEN_DEBUG === '1' || process.env.RESET_TOKEN_DEBUG === 'true';
  await audit({ actor: user.email, tenantId: 'system', action: 'auth.password.reset.request', target: `user:${user.id}` });
  const payload: Record<string, any> = { ok: true };
  if (debugMode) {
    payload.debugToken = raw;
    payload.debugLink = link;
  }
  const res = NextResponse.json(payload);
  const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
  Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k,v));
  // background cleanup
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  scheduleMaintenance();
  return res;
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
