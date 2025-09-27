'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'clients', label: 'Clients', href: '/admin/clients' },
  { key: 'content', label: 'Content', href: '/admin/content' },
  { key: 'scheduling', label: 'Scheduling', href: '/admin/scheduling' },
  { key: 'tasks', label: 'Tasks', href: '/admin/tasks' },
  { key: 'analytics', label: 'Analytics', href: '/admin/analytics' },
  { key: 'reports', label: 'Reports', href: '/admin/reports' },
  { key: 'integrations', label: 'Integrations', href: '/admin/integrations' },
  { key: 'media', label: 'Media', href: '/admin/media' },
  { key: 'settings', label: 'Settings', href: '/admin/settings' },
];

export default function AdminTopNav() {
  const pathname = usePathname() ?? '';

  // Make active tab detection resilient to basePath (e.g., '/app') and nested routes
  const activeKey = (() => {
    const idx = pathname.indexOf('/admin');
    if (idx === -1) return 'dashboard';
    const after = pathname.slice(idx + '/admin'.length); // e.g., '', '/analytics', '/clients/123'
    const seg = after.split('/').filter(Boolean)[0];
    return seg ?? 'dashboard';
  })();

  return (
    <div className="mb-8 overflow-x-auto">
      <nav className="flex items-center gap-3 p-2 min-w-max">
        {tabs.map((t) => {
          const isActive = activeKey === t.key;
          return (
            <Link
              key={t.key}
              href={t.href}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm ${
                isActive
                  ? 'bg-white text-blue-700 border-blue-200 shadow-md ring-1 ring-blue-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:shadow-md hover:-translate-y-[1px]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
