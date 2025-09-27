'use client';

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
  scheduling: 'Circuit',
    'client-calendars': 'Client Calendars',
    analytics: 'Analytics',
    reports: 'Reports',
    integrations: 'Integrations',
  media: 'Media',
  emails: 'Emails',
    email: 'Email',
    settings: 'Settings',
  };
  return map[seg] || 'Dashboard';
}

export default function AdminHeader({ title, subtitle, onSecurityClick: _onSecurityClick }: Props) {
  const pathname = usePathname() || '/';
  const section = deriveAdminSection(pathname);
  const mainTitle = 'SparQ Plug';
  // Email buttons removed per request; simplified header

  return (
    <div className="bg-[#1d74d0] text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-6">
        {/* Left: Logo placeholder + Title */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo placeholder (replace with <Image /> when asset ready) */}
          <div
            aria-label="Logo placeholder"
            className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-lg font-bold tracking-wide shadow-inner select-none"
          >
            <span className="text-white/90">SP</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate leading-none">{mainTitle}</h1>
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/15 border border-white/20 tracking-wide">ADMIN</span>
            </div>
            <p className="text-white/90 text-xs sm:text-sm truncate leading-snug">{section}{subtitle ? ` · ${subtitle}` : ''}</p>
          </div>
        </div>

        {/* Right: Auth controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <SignedInLogout />
        </div>
      </div>
    </div>
  );
}
