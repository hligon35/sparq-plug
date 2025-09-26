import { readJson, writeJson } from './storage';
import crypto from 'crypto';

export interface EmailAccount {
  id: string;
  address: string;            // full email address
  displayName: string;        // friendly display name
  username: string;           // local-part or login name
  provider: 'local' | 'google' | 'microsoft';
  forwarding: string[];       // list of forwarding addresses
  signature: string;          // HTML / plain (stored raw for now)
  active: boolean;
  notes?: string;
  lastUpdated: string;        // ISO timestamp
}

const DATA_KEY = 'email-accounts';

export interface EmailAccountsFile {
  accounts: EmailAccount[];
}

async function load(): Promise<EmailAccountsFile> {
  return readJson<EmailAccountsFile>(DATA_KEY, { accounts: [] });
}

async function save(data: EmailAccountsFile) {
  await writeJson<EmailAccountsFile>(DATA_KEY, data);
}

export async function listAccounts(): Promise<EmailAccount[]> {
  const data = await load();
  return data.accounts;
}

function normalizeEmail(v: string) {
  return v.trim().toLowerCase();
}

export interface CreateAccountInput {
  address: string;
  displayName?: string;
  username?: string;
  provider?: EmailAccount['provider'];
  forwarding?: string[];
  signature?: string;
  notes?: string;
}

export async function createAccount(input: CreateAccountInput): Promise<EmailAccount> {
  const data = await load();
  const address = normalizeEmail(input.address);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(address)) throw new Error('Invalid email address');
  if (data.accounts.some(a => a.address === address)) throw new Error('Address already exists');

  const username = input.username || address.split('@')[0];
  if (data.accounts.some(a => a.username === username)) throw new Error('Username already exists');

  const account: EmailAccount = {
    id: crypto.randomUUID(),
    address,
    displayName: input.displayName?.trim() || username,
    username,
    provider: input.provider || 'local',
    forwarding: (input.forwarding || []).map(normalizeEmail).filter(Boolean),
    signature: input.signature || '',
    active: true,
    notes: input.notes?.trim() || undefined,
    lastUpdated: new Date().toISOString(),
  };
  data.accounts.push(account);
  await save(data);
  return account;
}

export interface UpdateAccountInput {
  displayName?: string;
  username?: string;
  forwarding?: string[];
  signature?: string;
  active?: boolean;
  notes?: string;
  provider?: EmailAccount['provider'];
}

export async function updateAccount(id: string, patch: UpdateAccountInput): Promise<EmailAccount> {
  const data = await load();
  const idx = data.accounts.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Not found');
  const existing = data.accounts[idx];

  if (patch.username && patch.username !== existing.username) {
    if (data.accounts.some(a => a.username === patch.username)) throw new Error('Username already exists');
    existing.username = patch.username.trim();
  }
  if (patch.displayName !== undefined) existing.displayName = patch.displayName.trim();
  if (patch.forwarding) {
    existing.forwarding = patch.forwarding.map(f => f.trim().toLowerCase()).filter(Boolean);
  }
  if (patch.signature !== undefined) existing.signature = patch.signature;
  if (patch.active !== undefined) existing.active = !!patch.active;
  if (patch.notes !== undefined) existing.notes = patch.notes.trim() || undefined;
  if (patch.provider) existing.provider = patch.provider;
  existing.lastUpdated = new Date().toISOString();

  data.accounts[idx] = existing;
  await save(data);
  return existing;
}

export async function getAccount(id: string): Promise<EmailAccount | undefined> {
  const data = await load();
  return data.accounts.find(a => a.id === id);
}

export async function resetAccountPassword(id: string): Promise<{ resetToken: string }> {
  // NOTE: This is a placeholder. Actual implementation would integrate with provider.
  const acc = await getAccount(id);
  if (!acc) throw new Error('Not found');
  const resetToken = crypto.randomBytes(16).toString('hex');
  return { resetToken };
}
