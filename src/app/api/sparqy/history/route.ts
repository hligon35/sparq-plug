import { NextResponse } from 'next/server';
import { readJson } from '@/lib/storage';

type Msg = { role: 'user' | 'assistant'; content: string; time: string };
const STORE = 'sparqy_history';

export async function GET() {
  const messages = await readJson<Msg[]>(STORE, []);
  return NextResponse.json({ messages });
}
