export type ManagerTabKey = 'dashboard' | 'invoices' | 'clients' | 'analytics' | 'settings' | 'tasks';

export const managerRouteMap: Record<ManagerTabKey, string> = {
  dashboard: '/manager',
  invoices: '/manager?tab=invoices',
  clients: '/manager/clients',
  analytics: '/manager/analytics',
  settings: '/manager/settings',
  tasks: '/manager/tasks'
};

/**
 * Navigate to a manager section. For dashboard/invoices the caller can supply an internal handler
 * to switch local state instead of full navigation.
 */
export interface NavigateManagerOptions {
  /** Intercepts dashboard/invoices to allow internal state switching instead of route navigation */
  internalHandler?: (t: 'dashboard' | 'invoices') => void;
  /** Optional Next.js router-like object (supports push/replace) for SPA navigation */
  router?: { push: (path: string) => any; replace?: (path: string) => any };
  /** Use replace instead of push when using router */
  replace?: boolean;
}

// ---- Instrumentation Support ----
export type ManagerNavEvent = {
  tab: ManagerTabKey;
  /** true if handled internally (dashboard/invoices via internalHandler) */
  internal: boolean;
  /** delivery mechanism used */
  method: 'internal' | 'router' | 'hard';
  timestamp: number;
};

type Listener = (ev: ManagerNavEvent) => void;
const listeners: Set<Listener> = new Set();
let buffered: ManagerNavEvent[] = [];
let batching = false;

export function addManagerNavListener(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Remove all registered listeners (primarily for test isolation). */
export function removeAllManagerNavListeners() {
  listeners.clear();
}

/** Enable or disable batching; when enabled events accumulate until flushManagerNavEvents is called. */
export function setManagerNavBatching(enabled: boolean) {
  batching = enabled;
  if (!enabled) buffered = []; // reset when turning off
}

/** Flush buffered events to all listeners (no-op if batching disabled). */
export function flushManagerNavEvents() {
  if (!batching || buffered.length === 0) return;
  const toSend = buffered.slice();
  buffered = [];
  toSend.forEach(ev => listeners.forEach(l => { try { l(ev); } catch {} }));
}

function emit(ev: ManagerNavEvent) {
  if (batching) {
    buffered.push(ev);
    return;
  }
  if (listeners.size === 0) return;
  listeners.forEach(l => { try { l(ev); } catch {} });
}

/**
 * Navigate to a manager tab with graceful SPA fallback.
 * - If the tab is dashboard/invoices and an internalHandler is provided, it is used (no URL change unless caller syncs it).
 * - Else prefers provided router (push/replace) and falls back to window.location.href.
 */
export function navigateManager(tab: ManagerTabKey, opts?: NavigateManagerOptions) {
  if ((tab === 'dashboard' || tab === 'invoices') && opts?.internalHandler) {
    opts.internalHandler(tab);
    emit({ tab, internal: true, method: 'internal', timestamp: Date.now() });
    return;
  }
  const target = managerRouteMap[tab];
  if (opts?.router) {
    try {
      if (opts.replace && opts.router.replace) {
        opts.router.replace(target);
      } else {
        opts.router.push(target);
      }
      emit({ tab, internal: false, method: 'router', timestamp: Date.now() });
      return;
    } catch {
      // swallow and fallback
    }
  }
  // hard navigation fallback
  window.location.href = target;
  emit({ tab, internal: false, method: 'hard', timestamp: Date.now() });
}
