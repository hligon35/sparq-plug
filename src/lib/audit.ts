import { readJson, writeJson } from '@/lib/storage';

export interface AuditEvent {
  id: string;
  at: string; // ISO
  actor: string; // email or system
  tenantId: string;
  action: string; // e.g., invitation.create
  target?: string; // e.g., invitation:id
  metadata?: Record<string, unknown>;
}

const STORE = 'audit-log';

async function readAll(): Promise<AuditEvent[]> {
  return readJson<AuditEvent[]>(STORE, []);
}

export async function audit(event: Omit<AuditEvent, 'id' | 'at'>): Promise<void> {
  const items = await readAll();
  const entry: AuditEvent = {
    id: cryptoRandomId(),
    at: new Date().toISOString(),
    ...event,
  };
  await writeJson(STORE, [...items, entry]);
}

function cryptoRandomId(): string {
  // Low-dependency random id
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
