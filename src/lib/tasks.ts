import { readJson, writeJson } from '@/lib/storage';

export type TaskStatus = 'open' | 'in_progress' | 'done';

export interface TaskRecord {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  createdBy: string; // actor id/email
  assignee: string; // actor id/email
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const STORE = 'tasks';

interface TaskStoreFile { tasks: TaskRecord[] }

async function load(): Promise<TaskStoreFile> {
  return readJson<TaskStoreFile>(STORE, { tasks: [] });
}

async function save(file: TaskStoreFile) { await writeJson(STORE, file); }

function genId() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }

export async function listTasks(tenantId: string, opts?: { assignee?: string; createdBy?: string; mineFor?: string; scope?: 'mine' | 'all'; status?: TaskStatus[]; q?: string }) {
  const file = await load();
  let items = file.tasks.filter(t => t.tenantId === tenantId);
  if (opts?.scope !== 'all') {
    if (opts?.mineFor) items = items.filter(t => t.assignee === opts.mineFor || t.createdBy === opts.mineFor);
  }
  if (opts?.assignee) items = items.filter(t => t.assignee === opts.assignee);
  if (opts?.createdBy) items = items.filter(t => t.createdBy === opts.createdBy);
  if (opts?.status && opts.status.length) items = items.filter(t => opts.status!.includes(t.status));
  if (opts?.q) {
    const needle = opts.q.toLowerCase();
    items = items.filter(t => t.title.toLowerCase().includes(needle) || (t.description || '').toLowerCase().includes(needle));
  }
  // Newest first
  return items.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTask(tenantId: string, id: string) {
  const file = await load();
  return file.tasks.find(t => t.tenantId === tenantId && t.id === id);
}

export async function createTask(tenantId: string, data: { title: string; description?: string; assignee: string; actor: string }): Promise<TaskRecord> {
  if (!data.title?.trim()) throw new Error('Title required');
  if (!data.assignee?.trim()) throw new Error('Assignee required');
  const file = await load();
  const now = new Date().toISOString();
  const rec: TaskRecord = {
    id: genId(),
    tenantId,
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    createdBy: data.actor,
    assignee: data.assignee.trim(),
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };
  file.tasks.push(rec);
  await save(file);
  return rec;
}

export async function updateTaskStatus(tenantId: string, id: string, status: TaskStatus, actor: string): Promise<TaskRecord | undefined> {
  const file = await load();
  const rec = file.tasks.find(t => t.tenantId === tenantId && t.id === id);
  if (!rec) return undefined;
  // Basic authorization: creator or assignee can update.
  if (rec.assignee !== actor && rec.createdBy !== actor) throw new Error('Forbidden');
  const now = new Date().toISOString();
  rec.status = status;
  rec.updatedAt = now;
  if (status === 'done' && !rec.completedAt) rec.completedAt = now;
  await save(file);
  return rec;
}
