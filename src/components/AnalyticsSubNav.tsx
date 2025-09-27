'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/admin/analytics', key: 'overview', label: 'Overview' },
  { href: '/admin/analytics/socials', key: 'socials', label: 'Socials' },
  { href: '/admin/analytics/sites', key: 'sites', label: 'Sites' },
  { href: '/admin/analytics/revenue', key: 'revenue', label: 'Revenue' },
];

export default function AnalyticsSubNav() {
  const pathname = usePathname() || '';
  // identify active key
  const active = (() => {
    if (/\/analytics\/?$/.test(pathname)) return 'overview';
    const m = pathname.match(/\/analytics\/(\w+)/);
    return (m && m[1]) || 'overview';
  })();
  return (
    <div className="mb-6 overflow-x-auto">
      <div className="flex gap-2 p-1 bg-white rounded-full border border-gray-200 shadow-sm w-max">
        {items.map(i => {
          const is = active === i.key;
            return (
              <Link
                key={i.key}
                href={i.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  is ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-blue-50'
                }`}
                aria-current={is ? 'page' : undefined}
              >
                {i.label}
              </Link>
            );
        })}
      </div>
    </div>
  );
}
