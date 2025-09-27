import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { readJson } from '@/lib/storage';
import type { AuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get('session')?.value);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') || 200), 500);
  const actionFilter = searchParams.get('action') || undefined;
  const actorFilter = searchParams.get('actor') || undefined;
  const events = await readJson<AuditEvent[]>('audit-log', []);
  let list = events.slice(-2000); // cap scanning window
  if (actionFilter) list = list.filter(e => e.action === actionFilter);
  if (actorFilter) list = list.filter(e => e.actor === actorFilter);
  list = list.sort((a,b)=> a.at < b.at ? 1 : -1).slice(0, limit);
  return NextResponse.json({ items: list });
}
