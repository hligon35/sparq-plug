import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest, notFound } from '@/lib/apiResponse';
import { getBot, updateBot } from '@/features/bot_factory/services/botStorage';
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
