import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { ok, badRequest } from '@/lib/apiResponse';
import { createBot, listBots } from '@/features/bot_factory/services/botStorage';
import { audit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const g = apiGuard(req, { path: '/api/bots:GET', capability: 'bot_factory', rate: { windowMs: 10_000, max: 50 }, csrf: false });
  if (g instanceof Response) return g;
  const clientId = g.tenantId || 'default';
  const bots = await listBots(clientId);
  return ok({ bots });
}

export async function POST(req: NextRequest) {
  const g = apiGuard(req, { path: '/api/bots:POST', capability: 'bot_factory', rate: { windowMs: 10_000, max: 20 }, csrf: false });
  if (g instanceof Response) return g;
  try {
    const body = await req.json();
    if (!body.name || !Array.isArray(body.channels) || body.channels.length === 0) {
      return badRequest('name and channels required');
    }
    const clientId = g.tenantId || 'default';
    const bot = await createBot({
      clientId,
      name: String(body.name),
      channels: body.channels,
      persona: body.persona || '',
      guidelines: body.guidelines || '',
      intents: body.intents || [],
      replies: body.replies || [],
      escalationRules: body.escalationRules || { negativeSentimentThreshold: -0.4, maxUncertainBeforeHandoff: 2 },
      rateLimits: body.rateLimits || { perMinute: 10, perHour: 200, perDay: 1000 },
      sandbox: body.sandbox !== false,
    });
  await audit({ actor: g.actor, tenantId: clientId, action: 'bot.create', target: bot.id, metadata: { channels: bot.channels } });
    return ok({ bot });
  } catch (e: any) {
    return badRequest(e.message || 'failed');
  }
}
