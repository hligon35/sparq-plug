import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { on } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const g = apiGuard(request, { path: '/api/tasks/events:GET', capability: 'manage_team', rate: { windowMs: 10_000, max: 100 }, csrf: false });
  if (g instanceof Response) return g;
  const tenantId = g.tenantId;
  const stream = new ReadableStream({
    start(controller) {
      const enc = (s: string) => controller.enqueue(new TextEncoder().encode(s));
      enc('event: ready\ndata: {"ok":true}\n\n');
      const off = on(evt => { if (evt.tenantId === tenantId) enc(`event: ${evt.type}\ndata: ${JSON.stringify(evt)}\n\n`); });
      const heart = setInterval(()=>enc(`event: ping\ndata: ${Date.now()}\n\n`), 30000);
      // No direct abort signal on controller in this runtime; rely on stream cancel.
    }
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } });
}
