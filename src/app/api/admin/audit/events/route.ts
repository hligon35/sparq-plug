import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get('session')?.value);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 200);
    const cursor = searchParams.get('cursor') || undefined;
    const action = searchParams.get('action') || undefined;
    const actor = searchParams.get('actor') || undefined;

    const where: any = {};
    if (action) where.action = action;
    if (actor) where.actor = actor;

    const events = await prisma.auditEvent.findMany({
      where,
      orderBy: { at: 'desc' },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    let nextCursor: string | null = null;
    if (events.length > limit) {
      const popped = events.pop();
      nextCursor = popped!.id;
    }
    const data = events.map(e => ({
      id: e.id,
      at: e.at,
      actor: e.actor,
      action: e.action,
      target: e.target,
      metadata: parseJson(e.metadata),
    }));
    return NextResponse.json({ ok: true, events: data, nextCursor });
  } catch (e: any) {
    return NextResponse.json({ error: 'Query failed', detail: e.message }, { status: 500 });
  }
}

function parseJson(raw?: string | null) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return raw; }
}
