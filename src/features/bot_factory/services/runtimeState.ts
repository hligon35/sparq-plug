import { BotConfig } from './botTypes';

interface BotRuntimeState {
  recentDecisions: number[]; // timestamps (ms)
  lastEscalation?: number;
  uncertainCount: number;
}

const runtimeMap = new Map<string, BotRuntimeState>();

function getState(botId: string): BotRuntimeState {
  let st = runtimeMap.get(botId);
  if (!st) { st = { recentDecisions: [], uncertainCount: 0 }; runtimeMap.set(botId, st); }
  return st;
}

export interface RateLimitResult { allowed: boolean; reason?: string; }

export function checkRateLimit(bot: BotConfig, now = Date.now()): RateLimitResult {
  const st = getState(bot.id);
  const { rateLimits } = bot;
  // prune old
  const minuteAgo = now - 60_000;
  const hourAgo = now - 3_600_000;
  const dayAgo = now - 86_400_000;
  st.recentDecisions = st.recentDecisions.filter(ts => ts >= dayAgo);
  const perMinute = st.recentDecisions.filter(ts => ts >= minuteAgo).length;
  if (perMinute >= rateLimits.perMinute) return { allowed: false, reason: 'perMinute' };
  const perHour = st.recentDecisions.filter(ts => ts >= hourAgo).length;
  if (perHour >= rateLimits.perHour) return { allowed: false, reason: 'perHour' };
  const perDay = st.recentDecisions.length; // already pruned to 24h window
  if (perDay >= rateLimits.perDay) return { allowed: false, reason: 'perDay' };
  if (rateLimits.cooldownMs && st.lastEscalation && (now - st.lastEscalation) < rateLimits.cooldownMs) {
    return { allowed: false, reason: 'cooldown' };
  }
  return { allowed: true };
}

export function recordDecision(botId: string, action: string, now = Date.now()) {
  const st = getState(botId);
  st.recentDecisions.push(now);
  if (action === 'escalate') st.lastEscalation = now;
}

export function updateUncertain(botId: string, lowConfidence: boolean) {
  const st = getState(botId);
  if (lowConfidence) st.uncertainCount += 1; else st.uncertainCount = 0;
  return st.uncertainCount;
}

export function getUncertainCount(botId: string) {
  return getState(botId).uncertainCount;
}
