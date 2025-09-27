import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, passwordResetSuccessTemplate } from '@/lib/email';
import { evaluatePassword } from '@/lib/passwordPolicy';
import { audit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
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
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
