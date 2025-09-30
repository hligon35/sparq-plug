import { prisma } from '@/lib/prisma';

// Lightweight audit/analytics event emitters (subset restored after reset)
export interface BaseEvent { actor: string; tenantId?: string; action: string; target?: string; metadata?: Record<string, any> | null }
export async function emitEvent(e: BaseEvent) {
	try {
		await prisma.auditEvent.create({
			data: {
				actor: e.actor,
				tenantId: e.tenantId || 'system',
				action: e.action,
				target: e.target,
				metadata: e.metadata ? JSON.stringify(e.metadata).slice(0, 4000) : null,
			}
		});
	} catch (err) {
		console.error('[emitEvent] failed', (err as any)?.message);
	}
}
export async function loginSuccess(actor: string, userId: string) { return emitEvent({ actor, action: 'auth.login.success', target: `user:${userId}` }); }
export async function loginFailure(actor: string, reason: string, userId?: string) { return emitEvent({ actor, action: 'auth.login.fail', target: userId ? `user:${userId}` : 'user:unknown', metadata: { reason } }); }

// Aggregation helper used by /api/analytics/overview
export interface OverviewStats {
	totalUsers: number;
	logins24h: number;
	uniqueLoginActors24h: number;
	loginFailures24h: number;
	loginSuccesses7d: { date: string; count: number }[];
}
export async function getOverviewStats(now: Date = new Date()): Promise<OverviewStats> {
	const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	const [ totalUsers, loginSuccess24h, loginFailures24h, loginSuccesses7dRaw ] = await Promise.all([
		prisma.user.count(),
		prisma.auditEvent.count({ where: { action: 'auth.login.success', at: { gt: since24h } } }),
		prisma.auditEvent.count({ where: { action: 'auth.login.fail', at: { gt: since24h } } }),
		prisma.$queryRawUnsafe<{ date: string; count: number }[]>(
			`SELECT substr(at, 1, 10) AS date, COUNT(*) as count\n       FROM AuditEvent\n       WHERE action = 'auth.login.success' AND at > datetime(?1)\n       GROUP BY substr(at,1,10)\n       ORDER BY date ASC`, since7d.toISOString()
		)
	]);
	const uniqueActorsRows = await prisma.$queryRawUnsafe<{ actor: string }[]>(
		`SELECT DISTINCT actor FROM AuditEvent WHERE action='auth.login.success' AND at > datetime(?1)`, since24h.toISOString()
	);
	return {
		totalUsers,
		logins24h: loginSuccess24h,
		uniqueLoginActors24h: uniqueActorsRows.length,
		loginFailures24h,
		loginSuccesses7d: loginSuccesses7dRaw.map(r => ({ date: r.date, count: Number(r.count) })),
	};
}

// In-memory pub-sub for task events (single instance only)
export type EventType = 'task_created' | 'task_updated' | 'task_comment';
export interface EventPayload { type: EventType; tenantId: string; taskId: string; data?: any; ts: number }
type Listener = (e: EventPayload) => void;
const listeners = new Set<Listener>();
export function emit(evt: Omit<EventPayload,'ts'>) { const full: EventPayload = { ...evt, ts: Date.now() }; for (const l of listeners) { try { l(full); } catch {/* ignore */} } }
export function on(l: Listener) { listeners.add(l); return () => listeners.delete(l); }
