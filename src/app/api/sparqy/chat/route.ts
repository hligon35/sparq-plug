import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/storage';
import { publicBasePath } from '@/lib/basePath';

type Msg = { role: 'user' | 'assistant'; content: string; time: string };
const STORE = 'sparqy_history';

function synthesizeReply(input: string): { reply: string; sources: Array<{ title: string; link: string }> } {
  const trimmed = input.trim();
  let reply = `I hear you: "${trimmed}". I'm a placeholder assistant for now. I can store our chat history and echo responses.`;
  if (/help|how|what|where|why|when|guide|docs/i.test(trimmed)) {
    reply += '\n\nTry asking about: "How do I schedule a post?", "Where are my analytics?", or "How do I connect Instagram?"';
  }
  const bp = publicBasePath || '';
  const sources = [
    { title: 'Client Dashboard', link: `${bp}/client` },
    { title: 'Admin Dashboard', link: `${bp}/admin` },
  ];
  return { reply, sources };
}

export async function POST(req: NextRequest) {
  const body: unknown = await req.json().catch(() => ({}));
  const raw = (body as { message?: unknown })?.message;
  const message: string = typeof raw === 'string' ? raw : '';
  if (!message.trim()) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  const now = new Date().toISOString();
  const history = await readJson<Msg[]>(STORE, []);
  history.push({ role: 'user', content: message, time: now });
  const { reply, sources } = synthesizeReply(message);
  history.push({ role: 'assistant', content: reply, time: new Date().toISOString() });
  await writeJson(STORE, history);
  return NextResponse.json({ reply, sources });
}
