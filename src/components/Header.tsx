"use client";

import Link from 'next/link';
import SignedInLogout from './SignedInLogout';
import { usePathname } from 'next/navigation';

type Props = { title?: string; subtitle?: string };

function deriveSectionTitle(pathname: string): string {
  // Normalize basePath (e.g., '/app')
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const path = bp && pathname.startsWith(bp) ? pathname.slice(bp.length) || '/' : pathname;
  const seg = (needle: string) => {
    const i = path.indexOf(needle);
    if (i === -1) return null;
    const after = path.slice(i + needle.length);
    const first = after.split('/').filter(Boolean)[0] || 'dashboard';
    return first;
  };

  // Admin sections
  const admin = seg('/admin');
  if (admin !== null) {
    const map: Record<string, string> = {
      dashboard: 'Dashboard',
      clients: 'Clients',
      scheduling: 'Scheduling',
      analytics: 'Analytics',
      integrations: 'Integrations',
      media: 'Media',
      settings: 'Settings',
    };
    return map[admin] || 'Dashboard';
  }

  // Client sections
  const client = seg('/client');
  if (client !== null) {
    const map: Record<string, string> = {
      dashboard: 'Dashboard',
      content: 'Content',
      calendar: 'Calendar',
      analytics: 'Analytics',
      'social-accounts': 'Social Accounts',
      inbox: 'Inbox',
      'media-library': 'Media',
      team: 'Team',
      billing: 'Billing',
      settings: 'Settings',
    };
    return map[client] || 'Dashboard';
  }

  // Manager sections (fallback)
  const manager = seg('/manager');
  if (manager !== null) {
    const map: Record<string, string> = {
      dashboard: 'Dashboard',
      invoices: 'Invoices',
      clients: 'Clients',
      analytics: 'Analytics',
      settings: 'Settings',
    };
    return map[manager] || 'Dashboard';
  }

  return 'Dashboard';
}

// Header with uniform main title and dynamic subheader from nav
export default function Header({ title, subtitle }: Props) {
  const pathname = usePathname() || '/';
  const section = deriveSectionTitle(pathname);
  const mainTitle = 'SparQ Plug';
  return (
    <header className="w-full bg-[#1d74d0] text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center order-2 sm:order-1 min-w-0">
          <Link
            href={'https://portal.getsparqd.com/'}
            className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d74d0]"
          >
            <span aria-hidden>←</span>
            <span>Back to Portal</span>
          </Link>
        </div>
        <div className="text-center order-1 sm:order-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">{mainTitle}</h1>
          <p className="text-white/90 text-sm sm:text-base mt-0.5 truncate">{section}</p>
          {subtitle && <p className="text-white/80 text-xs sm:text-sm mt-1 truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-center sm:justify-end flex-wrap gap-2 order-3 sm:order-3 min-w-0">
          <SignedInLogout />
        </div>
      </div>
    </header>
  );
}
