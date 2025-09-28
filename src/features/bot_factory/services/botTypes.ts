export type BotChannel = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'email';

export interface BotIntent {
  id: string;
  name: string;           // e.g., pricing, greeting
  keywords: string[];     // simple keyword triggers
  replyTemplateIds: string[]; // associated canned replies
}

export interface BotReplyTemplate {
  id: string;
  title: string;
  body: string; // plain text or lightweight markdown
  channelOverrides?: Partial<Record<BotChannel, string>>; // per-channel variation
}

export interface EscalationRules {
  negativeSentimentThreshold: number; // e.g., -0.4 to -1 scale
  maxUncertainBeforeHandoff: number;  // number of low-confidence intent detections before escalate
  alwaysEscalateIntents?: string[];   // certain intents always handoff
  humanInboxAddress?: string;         // email or internal route for escalation
}

export interface RateLimitRules {
  perMinute: number;
  perHour: number;
  perDay: number;
  cooldownMs?: number; // optional cooldown after escalation or failure
}

export interface BotConfig {
  id: string;
  clientId: string;
  name: string;
  channels: BotChannel[];
  persona: string;        // persona description
  guidelines: string;     // brand voice guidelines
  intents: BotIntent[];
  replies: BotReplyTemplate[];
  escalationRules: EscalationRules;
  rateLimits: RateLimitRules;
  sandbox: boolean;       // sandbox mode (dry-run)
  active: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface BotDecisionTrace {
  at: string;
  channel: BotChannel;
  input: string;
  detectedIntentId?: string;
  confidence: number;
  sentiment: number;
  action: 'reply' | 'escalate' | 'rate_limited' | 'ignored';
  reason?: string;
  replyTemplateId?: string;
}
