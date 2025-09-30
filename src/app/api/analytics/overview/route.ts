import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getOverviewStats } from '@/lib/events';

export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get('session')?.value);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const stats = await getOverviewStats();
    return NextResponse.json({ ok: true, stats });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to compute stats', detail: e.message }, { status: 500 });
  }
}
