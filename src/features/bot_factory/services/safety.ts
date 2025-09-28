import { BotConfig } from './botTypes';

// Extremely naive profanity & PII filters (placeholder)
const PROFANITY = ['damn','shit','fuck'];
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
const PHONE_REGEX = /(\+?\d[\d\s\-]{6,}\d)/g;

export interface FilterResult {
  sanitized: string;
  blocked: boolean;
  reasons: string[];
}

export function applySafetyFilters(input: string): FilterResult {
  let sanitized = input;
  const reasons: string[] = [];

  for (const w of PROFANITY) {
    const re = new RegExp(`\\b${w}\\b`, 'ig');
    if (re.test(sanitized)) {
      sanitized = sanitized.replace(re, '*'.repeat(w.length));
      reasons.push(`profanity:${w}`);
    }
  }
  if (EMAIL_REGEX.test(sanitized)) {
    sanitized = sanitized.replace(EMAIL_REGEX, '[email]');
    reasons.push('pii:email');
  }
  if (PHONE_REGEX.test(sanitized)) {
    sanitized = sanitized.replace(PHONE_REGEX, '[phone]');
    reasons.push('pii:phone');
  }
  const blocked = reasons.some(r => r.startsWith('profanity'));
  return { sanitized, blocked, reasons };
}

export interface EscalationDecision {
  escalate: boolean;
  reason?: string;
}

export function evaluateEscalation(bot: BotConfig, sentiment: number, confidence: number, uncertainCount: number, intentId?: string): EscalationDecision {
  const rules = bot.escalationRules;
  if (sentiment <= rules.negativeSentimentThreshold) {
    return { escalate: true, reason: 'negative_sentiment' };
  }
  if (rules.alwaysEscalateIntents && intentId && rules.alwaysEscalateIntents.includes(intentId)) {
    return { escalate: true, reason: 'always_escalate_intent' };
  }
  if (confidence < 0.3 && uncertainCount >= rules.maxUncertainBeforeHandoff) {
    return { escalate: true, reason: 'low_confidence_repeat' };
  }
  return { escalate: false };
}
