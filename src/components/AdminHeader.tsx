'use client';

import Link from 'next/link';
import SignedInLogout from './SignedInLogout';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isEmailSetupEnabled } from '@/features/email_setup/feature';
import { hasBotFactoryAccessClient } from '@/features/bot_factory/access';

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
    email: 'Email',
    settings: 'Settings',
  };
  return map[seg] || 'Dashboard';
}

export default function AdminHeader({ title, subtitle, onSecurityClick: _onSecurityClick }: Props) {
  const pathname = usePathname() || '/';
  const section = deriveAdminSection(pathname);
  const mainTitle = 'SparQ Plug';
  const emailEnabled = isEmailSetupEnabled();
  const [localCap, setLocalCap] = useState<boolean | undefined>(undefined);
  const [roleAllowed, setRoleAllowed] = useState(false); // setup (admin/manager)
  const [clientEmailAllowed, setClientEmailAllowed] = useState(false); // inbox view
  const [botAllowed, setBotAllowed] = useState(false);

  useEffect(()=>{
    try {
      const cookieStr = document.cookie || '';
      const cookies: Record<string,string> = Object.fromEntries(cookieStr.split(';').map(c=>c.trim()).filter(Boolean).map(pair=>{ const i=pair.indexOf('='); const k=i===-1?pair:pair.slice(0,i); const v=i===-1?'':decodeURIComponent(pair.slice(i+1)); return [k,v]; }));
      const role = cookies['role'];
      // infer from admin path if cookie missing
      const pathFallback = pathname.includes('/admin');
  const allowed: boolean = (role === 'admin' || role === 'manager') || pathFallback;
  setRoleAllowed(allowed);
  setClientEmailAllowed(role === 'client' || role === 'admin' || role === 'manager');
  setBotAllowed(hasBotFactoryAccessClient());
  if(!allowed && emailEnabled){
        // eslint-disable-next-line no-console
        console.debug('[EmailSetup] AdminHeader button hidden: missing role cookie. Set role=admin or role=manager cookie for testing.');
      }
    } catch { setRoleAllowed(false); }
  },[pathname, emailEnabled]);

  useEffect(()=>{
    if(!emailEnabled) return; let cancelled=false;
    (async()=>{
      try{
        const res = await fetch('/api/email-setup/capabilities');
        const data = await res.json().catch(()=>({}));
        if(!cancelled){
          const allow = Boolean(data?.local?.enabled && data?.local?.scriptConfigured && data?.local?.scriptExists);
          setLocalCap(allow);
        }
      }catch{ if(!cancelled) setLocalCap(false); }
    })();
    return ()=>{ cancelled=true; };
  },[emailEnabled]);

  return (
    <div className="bg-[#1d74d0] text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 3-col grid to keep title centered regardless of left/right content widths */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 sm:gap-4 min-w-0">
          {/* Left */}
          <div className="flex items-center gap-2 order-2 sm:order-1 min-w-0" />

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
            {(emailEnabled && roleAllowed) && (
              <div className="inline-flex items-center gap-2 flex-wrap">
                {botAllowed && (
                  <Link
                    id="btn-produce-bot-global"
                    href="/bots/new"
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d74d0]"
                  >
                    Produce Bot
                  </Link>
                )}
                <Link
                  id="btn-email-setup"
                  href="/email-setup"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d74d0]"
                >
                  Email Setup
                </Link>
                <Link
                  id="btn-email-accounts"
                  href="/admin/email/accounts"
                  className="inline-flex items-center gap-2 rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d74d0]"
                >
                  Email Accounts
                </Link>
                {localCap !== undefined && (
                  <span title={localCap ? 'Local provisioning: available' : 'Local provisioning: unavailable'} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${localCap ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-50' : 'border-white/30 bg-white/10 text-white/80'}`}>
                    <span className={`h-2 w-2 inline-block rounded-full ${localCap ? 'bg-emerald-300' : 'bg-white/50'}`} />
                    Local {localCap ? 'On' : 'Off'}
                  </span>
                )}
              </div>
            )}
            {emailEnabled && !roleAllowed && clientEmailAllowed && (
              <div className="inline-flex items-center gap-2">
                <Link
                  id="btn-email-inbox"
                  href="/client/email"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d74d0]"
                >
                  Email
                </Link>
              </div>
            )}
            <SignedInLogout />
          </div>
        </div>
      </div>
    </div>
  );
}
