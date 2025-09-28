import { readJson, writeJson } from '@/lib/storage';

export interface NotificationRecord {
  id: string;
  tenantId: string;
  user: string; // recipient
  type: 'task_assigned' | 'task_completed' | 'task_comment';
  taskId?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface NotificationStore { notifications: NotificationRecord[] }

const STORE = 'notifications';

function genId() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }

async function load(): Promise<NotificationStore> { return readJson<NotificationStore>(STORE, { notifications: [] }); }
async function save(data: NotificationStore) { await writeJson(STORE, data); }

export async function addNotification(rec: Omit<NotificationRecord,'id'|'createdAt'|'read'>) {
  const store = await load();
  const item: NotificationRecord = { id: genId(), createdAt: new Date().toISOString(), read: false, ...rec };
  store.notifications.push(item);
  await save(store);
  return item;
}

export async function listNotifications(tenantId: string, user: string) {
  const store = await load();
  return store.notifications.filter(n => n.tenantId === tenantId && n.user === user).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}

export async function markNotificationsRead(tenantId: string, user: string, ids?: string[]) {
  const store = await load();
  let changed = 0;
  for (const n of store.notifications) {
    if (n.tenantId === tenantId && n.user === user && (!ids || ids.includes(n.id))) {
      if (!n.read) { n.read = true; changed++; }
    }
  }
  if (changed) await save(store);
  return changed;
}
