import { readJson, writeJson } from '@/lib/storage';

export interface TaskCommentRecord {
  id: string;
  tenantId: string;
  taskId: string;
  author: string;
  body: string;
  createdAt: string;
}

interface Store { comments: TaskCommentRecord[] }
const STORE = 'task-comments';

function genId() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }

async function load(): Promise<Store> { return readJson<Store>(STORE, { comments: [] }); }
async function save(s: Store) { await writeJson(STORE, s); }

export async function listComments(tenantId: string, taskId: string) {
  const store = await load();
  return store.comments.filter(c => c.tenantId === tenantId && c.taskId === taskId).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
}

export async function addComment(tenantId: string, taskId: string, author: string, body: string) {
  if (!body.trim()) throw new Error('Comment required');
  const store = await load();
  const rec: TaskCommentRecord = { id: genId(), tenantId, taskId, author, body: body.trim(), createdAt: new Date().toISOString() };
  store.comments.push(rec);
  await save(store);
  return rec;
}
