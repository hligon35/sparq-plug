"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SignedInLogout from './SignedInLogout';
import { isEmailSetupEnabled } from '@/features/email_setup/feature';
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

// Determine the path type and create badge
function getPathType(pathname: string): { type: string; emoji: string; color: string } | null {
  if (pathname.includes('/client')) {
    return { type: 'CLIENT', emoji: '👤', color: 'bg-green-500/20 border-green-300/50 text-green-100' };
  }
  if (pathname.includes('/manager')) {
    return { type: 'MANAGER', emoji: '👔', color: 'bg-blue-500/20 border-blue-300/50 text-blue-100' };
  }
  if (pathname.includes('/admin')) {
    return { type: 'ADMIN', emoji: '🔧', color: 'bg-red-500/20 border-red-300/50 text-red-100' };
  }
  return null;
}

// Header with uniform main title and dynamic subheader from nav
export default function Header({ title, subtitle }: Props) {
  const pathname = usePathname() || '/';
  const section = deriveSectionTitle(pathname);
  const pathType = getPathType(pathname);
  const mainTitle = 'SparQ Plug';
  const emailEnabled = isEmailSetupEnabled();
  const [localCap, setLocalCap] = useState<boolean | undefined>(undefined);
  const [roleAllowed, setRoleAllowed] = useState(false); // admin/manager for setup
  const [clientEmailAllowed, setClientEmailAllowed] = useState(false); // anyone with view_email capability

  // Determine role from cookie (client-side) and allow only admin or manager to view button
  useEffect(()=>{
    try {
      const cookieStr = document.cookie || '';
      const cookies: Record<string,string> = Object.fromEntries(cookieStr.split(';').map(c=>c.trim()).filter(Boolean).map(pair=>{ const i=pair.indexOf('='); const k=i===-1?pair:pair.slice(0,i); const v=i===-1?'':decodeURIComponent(pair.slice(i+1)); return [k,v]; }));
      const role = cookies['role'];
      // Fallback: if we're clearly inside an admin or manager route (pathType), allow it even if cookie missing (common in dev when cookie never set)
  const pathFallback = !!(pathType && (pathType.type === 'ADMIN' || pathType.type === 'MANAGER'));
  const allowed: boolean = (role === 'admin' || role === 'manager') || pathFallback;
      setRoleAllowed(allowed);
      // Determine if client inbox button should show (role present & email feature flag on)
      const inboxAllowed = role === 'client' || role === 'admin' || role === 'manager';
      setClientEmailAllowed(inboxAllowed);
      if (!allowed && emailEnabled) {
        // eslint-disable-next-line no-console
        console.debug('[EmailSetup] Button hidden: missing role cookie and not on admin/manager path. Set cookie "role=admin" or enable SSO gateway header x-portal-role.');
      }
    } catch { setRoleAllowed(false); }
  },[pathname, pathType, emailEnabled]);

  useEffect(() => {
    if (!emailEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/email-setup/capabilities');
        const data = await res.json().catch(() => ({}));
        if (!cancelled) {
          const allow = Boolean(data?.local?.enabled && data?.local?.scriptConfigured && data?.local?.scriptExists);
          setLocalCap(allow);
        }
      } catch {
        if (!cancelled) setLocalCap(false);
      }
    })();
    return () => { cancelled = true; };
  }, [emailEnabled]);
  
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
          {pathType && (
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${pathType.color}`}>
                {pathType.emoji} {pathType.type}
              </span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">{mainTitle}</h1>
          <p className="text-white/90 text-sm sm:text-base mt-0.5 truncate">{section}</p>
          {subtitle && <p className="text-white/80 text-xs sm:text-sm mt-1 truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-center sm:justify-end flex-wrap gap-2 order-3 sm:order-3 min-w-0">
          {emailEnabled && clientEmailAllowed && (
            <Link
              id="btn-email-inbox"
              href="/client/email"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d74d0]"
            >
              Email
            </Link>
          )}
          {emailEnabled && roleAllowed && (
            <>
              <Link
                id="btn-email-setup"
                href="/email-setup"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d74d0]"
              >
                Email Setup
              </Link>
              {localCap !== undefined && (
                <span title={localCap ? 'Local provisioning: available' : 'Local provisioning: unavailable'} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${localCap ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-50' : 'border-white/30 bg-white/10 text-white/80'}`}>
                  <span className={`h-2 w-2 inline-block rounded-full ${localCap ? 'bg-emerald-300' : 'bg-white/50'}`} />
                  Local {localCap ? 'On' : 'Off'}
                </span>
              )}
            </>
          )}
          <SignedInLogout />
        </div>
      </div>
    </header>
  );
}
