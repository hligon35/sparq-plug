import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get('session')?.value);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const [ total24h, success24h, fail24h ] = await Promise.all([
      prisma.auditEvent.count({ where: { at: { gt: since24h } } }),
      prisma.auditEvent.count({ where: { at: { gt: since24h }, action: 'auth.login.success' } }),
      prisma.auditEvent.count({ where: { at: { gt: since24h }, action: 'auth.login.fail' } }),
    ]);
    const distinctActorsRows = await prisma.$queryRawUnsafe<{ actor: string }[]>(
      `SELECT DISTINCT actor FROM AuditEvent WHERE at > datetime(?1) LIMIT 5000`, since24h.toISOString()
    );
    return NextResponse.json({ ok: true, stats: {
      events24h: total24h,
      loginSuccess24h: success24h,
      loginFail24h: fail24h,
      distinctActors24h: distinctActorsRows.length,
      generatedAt: now.toISOString(),
    }});
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to compute audit summary', detail: e.message }, { status: 500 });
  }
}
