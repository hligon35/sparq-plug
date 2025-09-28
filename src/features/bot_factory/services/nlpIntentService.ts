import { BotConfig, BotIntent } from './botTypes';

export interface IntentDetectionResult {
  intent?: BotIntent;
  confidence: number; // 0..1
  sentiment: number;  // -1..1 simple stub
  reason?: string;
}

// Very naive keyword + sentiment stub
export function detectIntentAndSentiment(bot: BotConfig, text: string): IntentDetectionResult {
  const lower = text.toLowerCase();
  let best: { intent?: BotIntent; score: number } = { intent: undefined, score: 0 };
  for (const intent of bot.intents) {
    const matches = intent.keywords.reduce((cnt, kw) => cnt + (lower.includes(kw.toLowerCase()) ? 1 : 0), 0);
    if (matches > 0) {
      const score = matches / intent.keywords.length;
      if (score > best.score) best = { intent, score };
    }
  }
  // Sentiment stub: naive token check
  const negativeTokens = ['angry','bad','terrible','hate','upset','refund'];
  const positiveTokens = ['great','thanks','love','awesome','good','amazing'];
  let sentiment = 0;
  for (const t of negativeTokens) if (lower.includes(t)) sentiment -= 0.2;
  for (const t of positiveTokens) if (lower.includes(t)) sentiment += 0.2;
  if (sentiment < -1) sentiment = -1; if (sentiment > 1) sentiment = 1;
  return { intent: best.intent, confidence: best.score, sentiment, reason: 'keyword+token heuristic' };
}
