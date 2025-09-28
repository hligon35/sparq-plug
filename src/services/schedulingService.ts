import { readJson, writeJson } from '@/lib/storage';
import { ScheduledPostModel, ListPostsParams } from '@/domain/scheduling';
import { emitAudit } from '@/core/audit';

// TODO: Replace mock composition with persistent store / database
import { randomUUID } from 'crypto';

// We keep the existing mock set inside service so API stays thin
const seed: ScheduledPostModel[] = [];
let seeded = false;

async function loadAll(): Promise<ScheduledPostModel[]> {
  if (!seeded) {
    seeded = true; // first access triggers merge; seed array intentionally empty (moved from route for brevity)
  }
  try {
    const stored = await readJson<ScheduledPostModel[]>('scheduled-posts', []);
    return mergeUnique(seed, stored);
  } catch {
    return seed.slice();
  }
}

function mergeUnique(primary: ScheduledPostModel[], secondary: ScheduledPostModel[]) {
  const map = new Map<string, ScheduledPostModel>();
  [...primary, ...secondary].forEach(p => map.set(p.id, p));
  return Array.from(map.values());
}

export async function listPosts(params: ListPostsParams): Promise<ScheduledPostModel[]> {
  let posts = await loadAll();
  const { clientId, managerId, status, platform, from, to } = params;
  if (clientId) posts = posts.filter(p => p.clientId === clientId);
  if (managerId === 'current') {
    const managerClientIds = ['tech-corp-1', 'restaurant-1'];
    posts = posts.filter(p => managerClientIds.includes(p.clientId));
  }
  if (status) {
    const allowed = status.split(',').map(s => s.trim().toLowerCase());
    posts = posts.filter(p => allowed.includes(p.status.toLowerCase()));
  }
  if (platform) {
    const platforms = platform.split(',').map(p => p.trim().toLowerCase());
    posts = posts.filter(p => p.platforms.some(pl => platforms.includes(pl.toLowerCase())));
  }
  if (from) {
    const fromDate = new Date(from); if (!isNaN(fromDate.getTime())) posts = posts.filter(p => new Date(p.scheduledAt) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to); if (!isNaN(toDate.getTime())) posts = posts.filter(p => new Date(p.scheduledAt) <= toDate);
  }
  return posts.slice().sort((a,b)=> new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export async function createPost(input: Omit<ScheduledPostModel,'id'>): Promise<ScheduledPostModel> {
  const items = await readJson<ScheduledPostModel[]>('scheduled-posts', []);
  const item: ScheduledPostModel = { ...input, id: randomUUID() };
  items.push(item);
  await writeJson('scheduled-posts', items);
  emitAudit({ type: 'scheduled_post.created', target: { type: 'scheduled_post', id: item.id }, meta: { clientId: item.clientId } });
  return item;
}

export function aggregateByDay(posts: ScheduledPostModel[]) {
  const byDate: Record<string, { date: string; total: number; clients: Record<string, { clientId: string; clientName: string; count: number; statuses: Record<string, number>; posts: ScheduledPostModel[] }> }> = {};
  for (const p of posts) {
    const dateKey = p.scheduledAt.slice(0,10);
    if (!byDate[dateKey]) byDate[dateKey] = { date: dateKey, total: 0, clients: {} };
    const bucket = byDate[dateKey];
    bucket.total += 1;
    if (!bucket.clients[p.clientId]) {
      bucket.clients[p.clientId] = { clientId: p.clientId, clientName: p.clientName, count: 0, statuses: {}, posts: [] };
    }
    const cb = bucket.clients[p.clientId];
    cb.count += 1;
    cb.statuses[p.status] = (cb.statuses[p.status] || 0) + 1;
    cb.posts.push(p);
  }
  return Object.values(byDate).sort((a,b)=> a.date.localeCompare(b.date));
}