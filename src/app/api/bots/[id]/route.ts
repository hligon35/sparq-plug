import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest, notFound } from '@/lib/apiResponse';
import { getBot, updateBot, listTraces, listBots, updateBot as updateBotBase } from '@/features/bot_factory/services/botStorage';
import { audit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/bots/[id]:PATCH', capability: 'bot_factory', rate: { windowMs: 10_000, max: 40 }, csrf: false });
  if (g instanceof Response) return g;
  const id = params.id;
  const body = await req.json().catch(()=>({}));
  const bot = await getBot(id);
  if (!bot) return notFound('Bot');
  try {
    const updated = await updateBot(id, body);
    await audit({ actor: g.actor, tenantId: g.tenantId, action: 'bot.update', target: id, metadata: { fields: Object.keys(body) } });
    return ok({ bot: updated });
  } catch (e: any) {
    return badRequest(e.message || 'update failed');
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/bots/[id]:GET', capability: 'bot_factory', rate: { windowMs: 10_000, max: 60 }, csrf: false });
  if (g instanceof Response) return g;
  const id = params.id;
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const bot = await getBot(id);
  if (!bot) return notFound('Bot');
  if (action === 'traces') {
    const traces = await listTraces(id);
    return ok({ traces });
  }
  return ok({ bot });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/bots/[id]:DELETE', capability: 'bot_factory', rate: { windowMs: 10_000, max: 20 }, csrf: false });
  if (g instanceof Response) return g;
  // Soft delete (mark inactive + name suffix)
  const bot = await getBot(params.id);
  if (!bot) return notFound('Bot');
  try {
    const updated = await updateBot(params.id, { active: false, name: bot.name + ' (deleted)' });
    await audit({ actor: g.actor, tenantId: g.tenantId, action: 'bot.delete', target: params.id });
    return ok({ bot: updated });
  } catch (e:any) { return badRequest(e.message || 'delete failed'); }
}
