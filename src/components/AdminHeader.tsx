'use client';

import Link from 'next/link';
import SignedInLogout from './SignedInLogout';
import { usePathname } from 'next/navigation';

type Props = {
  title: string;
  subtitle?: string;
  onSecurityClick?: () => void; // kept for backward compatibility; no longer rendered
};

function deriveAdminSection(pathname: string): string {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const path = bp && pathname.startsWith(bp) ? pathname.slice(bp.length) || '/' : pathname;
  const idx = path.indexOf('/admin');
  const after = idx === -1 ? '' : path.slice(idx + '/admin'.length);
  const seg = after.split('/').filter(Boolean)[0] || 'dashboard';
  const map: Record<string, string> = {
    dashboard: 'Dashboard',
    clients: 'Clients',
    content: 'Content Templates',
    scheduling: 'Scheduling',
    'client-calendars': 'Client Calendars',
    analytics: 'Analytics',
    reports: 'Reports',
    integrations: 'Integrations',
    media: 'Media',
    settings: 'Settings',
  };
  return map[seg] || 'Dashboard';
}

export default function AdminHeader({ title, subtitle, onSecurityClick: _onSecurityClick }: Props) {
  const pathname = usePathname() || '/';
  const section = deriveAdminSection(pathname);
  const mainTitle = 'SparQ Plug';

  return (
    <div className="bg-[#1d74d0] text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 3-col grid to keep title centered regardless of left/right content widths */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-4 min-w-0">
          {/* Left */}
          <div className="flex items-center gap-2 order-2 sm:order-1 min-w-0">
            <Link
              href={'https://portal.getsparqd.com/'}
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d74d0]"
            >
              <span aria-hidden>←</span>
              <span>Back to Portal</span>
            </Link>
          </div>

          {/* Centered Title */}
          <div className="text-center order-1 sm:order-2 min-w-0">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white/90 border border-white/30">
                🔧 ADMIN
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">{mainTitle}</h1>
            <p className="text-white/90 text-sm sm:text-base mt-0.5 truncate">{section}</p>
            {subtitle && <p className="text-white/80 text-xs sm:text-sm mt-1 truncate">{subtitle}</p>}
          </div>

          {/* Right: Uniform Signed In/Logout with timestamp */}
          <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap order-3 sm:order-3 min-w-0">
            <SignedInLogout />
          </div>
        </div>
      </div>
    </div>
  );
}
