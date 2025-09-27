import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { fetchAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get('session')?.value);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') || 100), 500);
  const action = searchParams.get('action') || undefined;
  const actor = searchParams.get('actor') || undefined;
  const cursor = searchParams.get('cursor') || undefined;
  const rows = await fetchAudit({ limit, action, actor, cursor });
  const items = rows.map((r: any) => ({ id: r.id, at: r.at.toISOString(), actor: r.actor, tenantId: r.tenantId, action: r.action, target: r.target || undefined, metadata: r.metadata }));
  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return NextResponse.json({ items, nextCursor });
}
