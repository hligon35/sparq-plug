import { prisma } from '@/lib/prisma';

let lastPrune = 0;
const PRUNE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const RETAIN_DAYS = 90; // audit retention window

export interface AuditEvent {
  id: string;
  at: string; // ISO timestamp for API consistency
  actor: string;
  tenantId: string;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
}

export async function audit(event: Omit<AuditEvent, 'id' | 'at'>): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: {
        actor: event.actor,
        tenantId: event.tenantId,
        action: event.action,
        target: event.target,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null
      }
    });
    const now = Date.now();
    if (now - lastPrune > PRUNE_INTERVAL_MS) {
      lastPrune = now;
      // fire-and-forget prune of old rows
      // eslint-disable-next-line no-floating-promises
      prisma.auditEvent.deleteMany({
        where: { at: { lt: new Date(Date.now() - RETAIN_DAYS * 24 * 60 * 60 * 1000) } }
      }).catch(()=>{});
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[audit] failed to persist event', e);
  }
}

export async function fetchAudit(options: { limit?: number; action?: string; actor?: string; cursor?: string }) {
  const { limit = 100, action, actor, cursor } = options;
  const take = Math.min(limit, 500);
  const rows = await prisma.auditEvent.findMany({
    where: {
      action: action || undefined,
      actor: actor || undefined,
      id: cursor ? { lt: cursor } : undefined
    },
    orderBy: { at: 'desc' },
    take
  });
  return rows.map(r => ({
    ...r,
    metadata: r.metadata ? safeParse(r.metadata) : undefined
  }));
}

function safeParse(s: string) {
  try { return JSON.parse(s); } catch { return { raw: s }; }
}
