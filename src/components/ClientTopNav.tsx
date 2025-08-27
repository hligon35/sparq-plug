'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', href: '/client' },
  { key: 'content', label: 'Content', href: '/client/content' },
  { key: 'calendar', label: 'Calendar', href: '/client/calendar' },
  { key: 'analytics', label: 'Analytics', href: '/client/analytics' },
  { key: 'social-accounts', label: 'Social Accounts', href: '/client/social-accounts' },
  { key: 'inbox', label: 'Inbox', href: '/client/inbox' },
  { key: 'media-library', label: 'Media', href: '/client/media-library' },
  { key: 'team', label: 'Team', href: '/client/team' },
  { key: 'billing', label: 'Billing', href: '/client/billing' },
  { key: 'settings', label: 'Settings', href: '/client/settings' },
];

export default function ClientTopNav() {
  const pathname = usePathname() ?? '';

  // Determine the active key based on path segment after '/client'
  const activeKey = (() => {
    const idx = pathname.indexOf('/client');
    if (idx === -1) return 'dashboard';
    const after = pathname.slice(idx + '/client'.length); // '', '/calendar', '/content/123'
    const seg = after.split('/').filter(Boolean)[0];
    return seg ?? 'dashboard';
  })();

  return (
    <div className="mb-6 overflow-x-auto">
      <nav className="flex items-center gap-3 p-2 min-w-max">
        {tabs.map((t) => {
          const isActive = activeKey === (t.key === 'dashboard' ? undefined : t.key) || (t.key === 'dashboard' && activeKey === 'dashboard');
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
