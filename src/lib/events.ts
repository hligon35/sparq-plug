// In-memory pub-sub for task events (single instance only)
export type EventType = 'task_created' | 'task_updated' | 'task_comment';
export interface EventPayload { type: EventType; tenantId: string; taskId: string; data?: any; ts: number }
type Listener = (e: EventPayload) => void;
const listeners = new Set<Listener>();
export function emit(evt: Omit<EventPayload,'ts'>) { const full: EventPayload = { ...evt, ts: Date.now() }; for (const l of listeners) { try { l(full); } catch {/* ignore */} } }
export function on(l: Listener) { listeners.add(l); return () => listeners.delete(l); }
