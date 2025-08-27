import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/storage';

export type SocialAccount = {
  id: string;
  platform: string;
  accountName: string;
  handle: string;
  followers: number;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync: string;
  posts: number;
  engagement: number; // percentage
  clientId?: string; // optional owner client
};

const STORE_KEY = 'social-accounts';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId') || undefined;
  const accounts = await readJson<SocialAccount[]>(STORE_KEY, []);
  const filtered = clientId ? accounts.filter(a => a.clientId === clientId) : accounts;
  return NextResponse.json({ accounts: filtered });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.platform || !body.accountName || !body.handle) {
    return NextResponse.json({ error: 'platform, accountName and handle are required' }, { status: 400 });
  }
  const accounts = await readJson<SocialAccount[]>(STORE_KEY, []);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const newAcc: SocialAccount = {
    id,
    platform: String(body.platform),
    accountName: String(body.accountName),
    handle: String(body.handle),
    followers: 0,
    status: 'connected',
    lastSync: 'just now',
    posts: 0,
    engagement: 0,
    clientId: body.clientId ? String(body.clientId) : undefined,
  };
  accounts.push(newAcc);
  await writeJson(STORE_KEY, accounts);
  return NextResponse.json({ account: newAcc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const accounts = await readJson<SocialAccount[]>(STORE_KEY, []);
  const next = accounts.filter(a => a.id !== id);
  const removed = next.length !== accounts.length;
  if (removed) await writeJson(STORE_KEY, next);
  return NextResponse.json({ ok: removed });
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const body = await req.json().catch(() => ({}));
  const targetId = String(id || body?.id || '');
  if (!targetId) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const accounts = await readJson<SocialAccount[]>(STORE_KEY, []);
  const idx = accounts.findIndex(a => a.id === targetId);
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const current = accounts[idx];
  const updated: SocialAccount = {
    ...current,
    accountName: body.accountName !== undefined ? String(body.accountName) : current.accountName,
    handle: body.handle !== undefined ? String(body.handle) : current.handle,
    status: body.status !== undefined ? (body.status as SocialAccount['status']) : current.status,
    lastSync: body.lastSync !== undefined ? String(body.lastSync) : current.lastSync,
  };
  accounts[idx] = updated;
  await writeJson(STORE_KEY, accounts);
  return NextResponse.json({ account: updated });
}
