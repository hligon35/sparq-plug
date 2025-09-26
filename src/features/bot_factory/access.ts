"use client";
import { isBotFactoryEnabled } from './feature';
import { can } from '@/lib/roles';

// Client-side check using cookie role + roles capability map.
// Dev fallbacks: if on an /admin path (or query ?botFactory=1) treat as allowed to surface UI while still relying on API guard for real enforcement.
export function hasBotFactoryAccessClient(): boolean {
  const enabledFlag = isBotFactoryEnabled();
  try {
    const loc = typeof window !== 'undefined' ? window.location : undefined;
    const qpOverride = loc ? new URLSearchParams(loc.search).get('botFactory') === '1' : false;
    if (!enabledFlag && !qpOverride) return false;

    const cookieStr = document.cookie || '';
    const cookies: Record<string,string> = Object.fromEntries(cookieStr.split(';').map(c=>c.trim()).filter(Boolean).map(p=>{ const i=p.indexOf('='); const k=i===-1?p:p.slice(0,i); const v=i===-1?'':decodeURIComponent(p.slice(i+1)); return [k,v]; }));
    const role = cookies['role'] || '';
    if (can(role,'bot_factory')) return true;

    // Fallback: allow UI on admin routes for development if role cookie missing.
    const path = loc?.pathname || '';
    if (path.includes('/admin')) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[BotFactory] Fallback granting UI access on /admin path without role cookie (dev only). Set role=admin or role=manager cookie to persist.');
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}
