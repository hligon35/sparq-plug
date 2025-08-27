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
};

const STORE_KEY = 'social-accounts';

export async function GET() {
  const accounts = await readJson<SocialAccount[]>(STORE_KEY, []);
  return NextResponse.json({ accounts });
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
