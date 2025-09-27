import { rootLogger } from './logger';
import { isFlagEnabled } from './featureFlags';

export interface AuditEvent {
  type: string;
  actor?: { id?: string; role?: string };
  target?: { type: string; id?: string };
  meta?: Record<string, any>;
  at?: string;
}

export function emitAudit(event: AuditEvent) {
  if (!isFlagEnabled('audit_logging')) return;
  rootLogger.info('audit.event', { ...event, at: event.at || new Date().toISOString() });
}