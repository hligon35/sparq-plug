'use client';

import SignedInLogout from './SignedInLogout';
import dynamic from 'next/dynamic';
// @ts-ignore - available at runtime
import HelpMenu from './HelpMenu';
import { usePathname } from 'next/navigation';

const DebugPanel = dynamic(() => import('./DebugPanel'), { ssr: false });

type Props = { title?: string; subtitle?: string };

function deriveManagerSection(pathname: string): string {
  const idx = pathname.indexOf('/manager');
  const after = idx === -1 ? '' : pathname.slice(idx + '/manager'.length);
  const seg = after.split('/').filter(Boolean)[0] || 'dashboard';
  const map: Record<string,string> = {
    dashboard: 'Dashboard',
    invoices: 'Invoices',
    clients: 'Clients',
    analytics: 'Analytics',
    tasks: 'Tasks',
    settings: 'Settings',
    'unified-planner': 'Unified Planner',
    'client-calendars': 'Client Calendars',
  };
  return map[seg] || 'Dashboard';
}

export default function ManagerHeader({ title, subtitle }: Props) {
  const pathname = usePathname() || '/';
  const section = deriveManagerSection(pathname);
  const mainTitle = title || 'SparQ Plug';
  return (
    <div className="bg-[#1d74d0] text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-4">
            <div aria-label="Logo placeholder" className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-lg font-bold tracking-wide shadow-inner select-none">
              <span className="text-white/90">SP</span>
            </div>
            <div className="min-w-0 hidden sm:block">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate leading-none">{mainTitle}</h1>
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/15 border border-white/20 tracking-wide">MANAGER</span>
              </div>
              <p className="text-white/90 text-xs sm:text-sm truncate leading-snug">{section}{subtitle ? ` · ${subtitle}` : ''}</p>
            </div>
          </div>
          <div className="sm:hidden text-center">
            <h1 className="text-2xl font-extrabold tracking-tight leading-none mb-1">{mainTitle}</h1>
            <div className="text-white/90 text-xs leading-snug">{section}{subtitle ? ` · ${subtitle}` : ''}</div>
          </div>
        </div>
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
