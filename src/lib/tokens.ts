import { readJson, writeJson } from '@/lib/storage';

export interface TokenRecord {
  id: string; // uuid-like
  tenantId: string;
  user?: string; // email or user id
  provider: string; // e.g., 'adobe-express', 'canva'
  accessToken: string;
  refreshToken?: string;
  scopes?: string[];
  obtainedAt: string; // ISO
  expiresAt?: string; // ISO
}

const STORE = 'provider-tokens';

async function readAll(): Promise<TokenRecord[]> {
  return readJson<TokenRecord[]>(STORE, []);
}

async function writeAll(items: TokenRecord[]): Promise<void> {
  await writeJson(STORE, items);
}

export async function saveToken(rec: Omit<TokenRecord, 'id' | 'obtainedAt'>): Promise<TokenRecord> {
  const items = await readAll();
  const now = new Date().toISOString();
  // Upsert by (tenantId, user, provider)
  const idx = items.findIndex((t) => t.tenantId === rec.tenantId && t.user === rec.user && t.provider === rec.provider);
  const entry: TokenRecord = { id: genId(), obtainedAt: now, ...rec };
  if (idx >= 0) items[idx] = entry; else items.push(entry);
  await writeAll(items);
  return entry;
}

export async function getToken(provider: string, tenantId: string, user?: string): Promise<TokenRecord | undefined> {
  const items = await readAll();
  return items.find((t) => t.provider === provider && t.tenantId === tenantId && t.user === user);
}

export async function listTokens(tenantId: string): Promise<TokenRecord[]> {
  const items = await readAll();
  return items.filter((t) => t.tenantId === tenantId);
}

export async function revokeToken(provider: string, tenantId: string, user?: string): Promise<boolean> {
  const items = await readAll();
  const next = items.filter((t) => !(t.provider === provider && t.tenantId === tenantId && t.user === user));
  if (next.length === items.length) return false;
  await writeAll(next);
  return true;
}

function genId(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
