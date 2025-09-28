import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(req: Request) {
  // Only admins may view metrics
  const cookie = (req as any).headers?.get?.('cookie') || '';
  const sessionToken = cookie
    .split(';')
    .map((p: string) => p.trim())
    .find((p: string) => p.startsWith('session='))
    ?.split('=')[1];
  const session = await verifySession(sessionToken);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const [userCount, pendingRegs, recentAudits] = await Promise.all([
    prisma.user.count(),
    prisma.registrationRequest.count({ where: { status: 'pending' } }),
    prisma.auditEvent.count({ where: { at: { gt: new Date(Date.now() - 24*60*60*1000) } } })
  ]);
  return NextResponse.json({ userCount, pendingRegistrations: pendingRegs, auditEventsLast24h: recentAudits });
}