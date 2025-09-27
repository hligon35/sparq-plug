import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest } from '@/lib/apiResponse';
import { listNotifications, markNotificationsRead } from '@/lib/notificationsStore';

export async function GET(req: NextRequest) {
  const g = apiGuard(req, { path: '/api/notifications:GET', capability: 'manage_team', rate: { windowMs: 10_000, max: 80 }, csrf: false });
  if (g instanceof Response) return g;
  const list = await listNotifications(g.tenantId, g.actor);
  return ok({ notifications: list });
}

// PATCH { ids?: string[] } => mark read
export async function PATCH(req: NextRequest) {
  const g = apiGuard(req, { path: '/api/notifications:PATCH', capability: 'manage_team', rate: { windowMs: 10_000, max: 40 }, csrf: true });
  if (g instanceof Response) return g;
  const body = await req.json().catch(()=>({}));
  const ids = Array.isArray(body.ids) ? body.ids.map(String) : undefined;
  const changed = await markNotificationsRead(g.tenantId, g.actor, ids);
  return ok({ updated: changed });
}
