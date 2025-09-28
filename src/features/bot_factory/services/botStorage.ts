import { readJson, writeJson } from '@/lib/storage';
import { BotConfig, BotDecisionTrace } from './botTypes';
import crypto from 'crypto';

interface BotStoreFile {
  bots: BotConfig[];
  traces: Record<string, BotDecisionTrace[]>; // keyed by botId
}

const STORE_KEY = 'bot-factory-store';

async function load(): Promise<BotStoreFile> {
  return readJson<BotStoreFile>(STORE_KEY, { bots: [], traces: {} });
}

async function save(data: BotStoreFile) {
  await writeJson(STORE_KEY, data);
}

export async function listBots(clientId?: string): Promise<BotConfig[]> {
  const data = await load();
  return clientId ? data.bots.filter(b => b.clientId === clientId) : data.bots;
}

export async function getBot(id: string): Promise<BotConfig | undefined> {
  const data = await load();
  return data.bots.find(b => b.id === id);
}

export interface CreateBotInput {
  clientId: string;
  name: string;
  channels: BotConfig['channels'];
  persona: string;
  guidelines: string;
  intents: BotConfig['intents'];
  replies: BotConfig['replies'];
  escalationRules: BotConfig['escalationRules'];
  rateLimits: BotConfig['rateLimits'];
  sandbox?: boolean;
}

export async function createBot(input: CreateBotInput): Promise<BotConfig> {
  const data = await load();
  const now = new Date().toISOString();
  const bot: BotConfig = {
    id: crypto.randomUUID(),
    clientId: input.clientId,
    name: input.name.trim(),
    channels: input.channels,
    persona: input.persona,
    guidelines: input.guidelines,
    intents: input.intents,
    replies: input.replies,
    escalationRules: input.escalationRules,
    rateLimits: input.rateLimits,
    sandbox: !!input.sandbox,
    active: false,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
  data.bots.push(bot);
  await save(data);
  return bot;
}

export interface UpdateBotInput extends Partial<Omit<CreateBotInput, 'clientId'>> {
  active?: boolean;
  version?: number;
}

export async function updateBot(id: string, patch: UpdateBotInput): Promise<BotConfig> {
  const data = await load();
  const idx = data.bots.findIndex(b => b.id === id);
  if (idx === -1) throw new Error('Bot not found');
  const existing = data.bots[idx];
  const now = new Date().toISOString();
  Object.assign(existing, patch, { updatedAt: now });
  existing.version = (existing.version || 1) + 1;
  data.bots[idx] = existing;
  await save(data);
  return existing;
}

export async function recordTrace(botId: string, trace: Omit<BotDecisionTrace, 'at'>) {
  const data = await load();
  if (!data.traces[botId]) data.traces[botId] = [];
  data.traces[botId].push({ ...trace, at: new Date().toISOString() });
  // Keep only last 200 traces per bot
  if (data.traces[botId].length > 200) data.traces[botId] = data.traces[botId].slice(-200);
  await save(data);
}

export async function listTraces(botId: string): Promise<BotDecisionTrace[]> {
  const data = await load();
  return data.traces[botId] || [];
}
