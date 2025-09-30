"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Deployment/version stamp to verify layout update propagation
console.log('[ADMIN_LAYOUT_VERSION] 2025-09-28T18:45Z remove-header-v1');

// Client wrapper so we can highlight active nav
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <LegacyAdminHeader />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}

interface Meta { subtitle: string; }

function computeSubtitle(path: string): string {
  const table: { test: RegExp; value: string }[] = [
    { test: /^\/admin\/?$/, value: 'Dashboard · High-level operational snapshot' },
    { test: /^\/admin\/clients/, value: 'Clients · Manage client accounts & relationships' },
    { test: /^\/admin\/content/, value: 'Content · Create and curate assets' },
    { test: /^\/admin\/tasks/, value: 'Tasks · Track and complete work items' },
    { test: /^\/admin\/analytics/, value: 'Analytics · Auth event instrumentation' },
    { test: /^\/admin\/reports/, value: 'Reports · Generate and manage business reports and analytics' },
    { test: /^\/admin\/integrations/, value: 'Integrations · Connect external services' },
    { test: /^\/admin\/media/, value: 'Media · Manage uploaded files & assets' },
    { test: /^\/admin\/emails/, value: 'Emails · Delivery & templates' },
    { test: /^\/admin\/audit/, value: 'Audit · Security & system event visibility' },
  ];
  for (const row of table) if (row.test.test(path)) return row.value;
  return 'Admin Console';
}

function LegacyAdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [now, setNow] = useState<string>(() => new Date().toLocaleString());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toLocaleString()), 15_000); // refresh every 15s
    return () => clearInterval(id);
  }, []);

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {/* ignore */}
    router.push('/login');
  }

  const subtitle = computeSubtitle(pathname || '/admin');

  return (
    <header className="w-full bg-[#1d74d0] text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-4">
            <div aria-label="Logo placeholder" className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-lg font-bold tracking-wide shadow-inner select-none">
              <span className="text-white/90">SP</span>
            </div>
            <div className="min-w-0 hidden sm:block">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate leading-none">SparQ Plug</h1>
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/15 border border-white/20 tracking-wide">ADMIN</span>
              </div>
              <p className="text-white/90 text-xs sm:text-sm truncate leading-snug">{subtitle}</p>
            </div>
          </div>
          <div className="sm:hidden text-center">
            <h1 className="text-2xl font-extrabold tracking-tight leading-none mb-1">SparQ Plug</h1>
            <div className="text-white/90 text-xs leading-snug">{subtitle}</div>
          </div>
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap order-last -mt-1">
          <div className="flex items-center gap-2 h-10 relative">
            <div className="relative">
              <button type="button" aria-haspopup="true" className="inline-flex items-center gap-2 bg-white text-[#1d74d0] hover:bg-blue-50 px-3 py-2 rounded-full text-sm font-semibold shadow" title="Help & Resources">
                <span aria-hidden="true">❓</span>
                <span className="hidden sm:inline">Help</span>
                <span className="sm:hidden">Help</span>
              </button>
            </div>
            <div className="relative">
              <button className="inline-flex items-center gap-2 bg-white text-[#1d74d0] hover:bg-blue-50 px-3 py-2 rounded-full text-sm font-semibold shadow" aria-label="Debug panel" title="Toggle debug panel" type="button">
                <span aria-hidden="true">🛠️</span>
                <span className="hidden sm:inline">Debug</span>
                <span className="sm:hidden">Dbg</span>
              </button>
            </div>
            <div className="relative flex items-center ">
              <button onClick={logout} className="inline-flex items-center h-10 gap-2 bg-white text-[#1d74d0] hover:bg-blue-50 px-3 rounded-full text-sm font-semibold shadow max-w-full" aria-label="Logout" title={`Logout ${now}`}>
                <span aria-hidden="true">🧑</span>
                <span className="hidden sm:inline truncate">Logout</span>
                <span className="sm:hidden">Logout</span>
              </button>
              <div className="absolute left-1/2 translate-x-[-50%] -bottom-3 sm:left-auto sm:right-0 sm:translate-x-0 text-[10px] leading-none text-white/80 whitespace-nowrap" aria-live="polite">{now}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
