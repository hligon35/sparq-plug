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
export function navigateManager(
  tab: ManagerTabKey,
  opts?: { internalHandler?: (t: 'dashboard' | 'invoices') => void }
) {
  if ((tab === 'dashboard' || tab === 'invoices') && opts?.internalHandler) {
    opts.internalHandler(tab);
    return;
  }
  window.location.href = managerRouteMap[tab];
}
