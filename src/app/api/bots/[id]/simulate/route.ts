import { NextRequest } from 'next/server';
import { apiGuard } from '@/lib/apiGuard';
import { badRequest, ok } from '@/lib/apiResponse';
import { getBot, recordTrace } from '@/features/bot_factory/services/botStorage';
import { detectIntentAndSentiment } from '@/features/bot_factory/services/nlpIntentService';
import { applySafetyFilters, evaluateEscalation } from '@/features/bot_factory/services/safety';
import { checkRateLimit, recordDecision, updateUncertain, getUncertainCount } from '@/features/bot_factory/services/runtimeState';
import { BotDecisionTrace, BotReplyTemplate } from '@/features/bot_factory/services/botTypes';

// POST /api/bots/[id]/simulate
// body: { channel: BotChannel; input: string }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const g = apiGuard(req, { path: '/api/bots/[id]/simulate:POST', capability: 'bot_factory', rate: { windowMs: 10_000, max: 40 }, csrf: false });
  if (g instanceof Response) return g;
  try {
    const { id } = params;
    const bot = await getBot(id);
    if (!bot) return badRequest('Bot not found');
    if (!bot.active) return badRequest('Bot inactive');

    const body = await req.json().catch(() => ({}));
    const channel = body.channel as string | undefined;
    const input = (body.input as string | undefined)?.trim();
    if (!channel || !input) return badRequest('channel and input required');
    if (!bot.channels.includes(channel as any)) return badRequest('Channel not enabled for bot');

    // Safety filters
    const safety = applySafetyFilters(input);
    if (safety.blocked) {
      const trace: Omit<BotDecisionTrace,'at'> = {
        channel: channel as any,
        input,
        confidence: 0,
        sentiment: 0,
        action: 'ignored',
        reason: 'blocked_by_safety:' + safety.reasons.join(','),
      };
      await recordTrace(bot.id, trace);
  return ok({ action: 'blocked', reasons: safety.reasons, sanitized: safety.sanitized });
    }

    // Rate limit check
    const rl = checkRateLimit(bot);
    if (!rl.allowed) {
      const trace: Omit<BotDecisionTrace,'at'> = {
        channel: channel as any,
        input: safety.sanitized,
        confidence: 0,
        sentiment: 0,
        action: 'rate_limited',
        reason: rl.reason,
      };
      await recordTrace(bot.id, trace);
      return ok({ botId: bot.id, action: 'rate_limited', reason: rl.reason, traceRecorded: true });
    }

    // Intent + sentiment
    const det = detectIntentAndSentiment(bot, safety.sanitized);
    const uncertainCount = updateUncertain(bot.id, det.confidence < 0.3);
    const esc = evaluateEscalation(bot, det.sentiment, det.confidence, uncertainCount, det.intent?.id);

    let action: BotDecisionTrace['action'];
    let replyTemplate: BotReplyTemplate | undefined;
    let reason: string | undefined;
    if (esc.escalate) {
      action = 'escalate';
      reason = esc.reason;
    } else if (det.intent && det.confidence >= 0.2) {
      // Pick first reply template id
      const rId = det.intent.replyTemplateIds[0];
      replyTemplate = bot.replies.find(r => r.id === rId);
      if (replyTemplate) {
        action = 'reply';
      } else {
        action = 'ignored';
        reason = 'no_reply_template';
      }
    } else {
      action = 'ignored';
      reason = 'low_confidence';
    }

    const trace: Omit<BotDecisionTrace,'at'> = {
      channel: channel as any,
      input: safety.sanitized,
      detectedIntentId: det.intent?.id,
      confidence: det.confidence,
      sentiment: det.sentiment,
      action,
      reason,
      replyTemplateId: replyTemplate?.id,
    };
  await recordTrace(bot.id, trace);
  recordDecision(bot.id, action);

    const ch = channel as any; // runtime validated earlier
    return ok({
      botId: bot.id,
      action,
      intent: det.intent ? { id: det.intent.id, name: det.intent.name } : null,
      confidence: det.confidence,
      sentiment: det.sentiment,
      escalation: esc.escalate ? esc.reason : null,
      reply: replyTemplate ? {
        id: replyTemplate.id,
        body: (replyTemplate.channelOverrides && (replyTemplate.channelOverrides as any)[ch]) || replyTemplate.body,
      } : null,
  traceRecorded: true,
  uncertainCount: getUncertainCount(bot.id),
    });
  } catch (e: unknown) {
    return badRequest((e as Error).message);
  }
}
