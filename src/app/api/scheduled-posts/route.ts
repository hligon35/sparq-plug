import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/storage';

type ScheduledPost = {
  id: string;
  content: string;
  platforms: string[];
  client: string;
  scheduledAt: string; // ISO
  status: 'Scheduled' | 'Draft' | 'Published' | 'Failed';
};

export async function GET() {
  const items = await readJson<ScheduledPost[]>('scheduled-posts', []);
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.content || !Array.isArray(body?.platforms) || !body?.scheduledAt) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const items = await readJson<ScheduledPost[]>('scheduled-posts', []);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item: ScheduledPost = {
    id,
    content: body.content,
    platforms: body.platforms,
    client: body.client || 'Default',
    scheduledAt: body.scheduledAt,
    status: body.status || 'Scheduled',
  };
  items.push(item);
  await writeJson('scheduled-posts', items);
  return NextResponse.json({ item }, { status: 201 });
}
