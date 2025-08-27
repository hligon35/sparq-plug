import { NextResponse } from 'next/server';
import { writeJson } from '@/lib/storage';

const STORE = 'sparqy_history';

export async function POST() {
  await writeJson(STORE, []);
  return NextResponse.json({ ok: true });
}
