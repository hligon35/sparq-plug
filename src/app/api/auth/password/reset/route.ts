import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { evaluatePassword } from '@/lib/passwordPolicy';
import { audit } from '@/lib/audit';
import { rateLimitCheck, rateLimitHeaders, rateLimitKeyFromRequest } from '@/lib/rateLimit';
import { scheduleMaintenance } from '@/lib/maintenance';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const limiterOpts = { windowMs: 15 * 60_000, max: 10 } as const;
    const key = rateLimitKeyFromRequest({ ip, path: '/api/auth/password/reset' });
    const limit = rateLimitCheck(key, limiterOpts);
    if (!limit.allowed) {
      const res = NextResponse.json({ error: 'Too many requests' }, { status: 429 });
      const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
      Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k,v));
      return res;
    }
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    const pwEval = evaluatePassword(password);
    if (!pwEval.ok) return NextResponse.json({ error: 'Weak password', details: pwEval.errors }, { status: 400 });
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const prt = await prisma.passwordResetToken.findFirst({ where: { tokenHash: hash }, include: { user: true } });
    const now = new Date();
    if (!prt || prt.expiresAt < now) {
      // Clean up if expired
      if (prt) await prisma.passwordResetToken.delete({ where: { id: prt.id } });
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: prt.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: prt.userId } })
    ]);
    await audit({ actor: prt.user.email, tenantId: 'system', action: 'auth.password.reset', target: `user:${prt.userId}` });
    const res = NextResponse.json({ ok: true });
    const hdrs = rateLimitHeaders(limit.remaining, limiterOpts);
    Object.entries(hdrs).forEach(([k,v]) => res.headers.set(k,v));
    // background cleanup
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    scheduleMaintenance();
    return res;
  } catch (e:any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
