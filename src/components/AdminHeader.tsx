'use client';

import SignedInLogout from './SignedInLogout';
import dynamic from 'next/dynamic';
const DebugPanel = dynamic(() => import('./DebugPanel'), { ssr: false });
// @ts-ignore - temporary resolution suppression (file exists at runtime)
import HelpMenu from './HelpMenu';
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

  return (
    <div className="bg-[#1d74d0] text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Top (mobile) / Left (desktop): Logo + Title */}
        <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-4">
            <div
              aria-label="Logo placeholder"
              className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-lg font-bold tracking-wide shadow-inner select-none"
            >
              <span className="text-white/90">SP</span>
            </div>
            <div className="min-w-0 hidden sm:block">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate leading-none">{mainTitle}</h1>
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/15 border border-white/20 tracking-wide">ADMIN</span>
              </div>
              <p className="text-white/90 text-xs sm:text-sm truncate leading-snug">{section}{subtitle ? ` · ${subtitle}` : ''}</p>
            </div>
          </div>
          {/* Centered title stack on mobile */}
          <div className="sm:hidden text-center">
            <h1 className="text-2xl font-extrabold tracking-tight leading-none mb-1">{mainTitle}</h1>
            <div className="text-white/90 text-xs leading-snug">{section}{subtitle ? ` · ${subtitle}` : ''}</div>
          </div>
        </div>

        {/* Buttons Row (mobile bottom / desktop right) */}
        <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap order-last -mt-1">
          <div className="flex items-center gap-2 h-10 relative">
            <HelpMenu />
            <DebugPanel />
            <SignedInLogout />
          </div>
        </div>
      </div>
    </div>
  );
}
