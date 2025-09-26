"use client";
import { isBotFactoryEnabled } from './feature';
import { can } from '@/lib/roles';

// Client-side check using cookie role + roles capability map.
export function hasBotFactoryAccessClient(): boolean {
  if (!isBotFactoryEnabled()) return false;
  try {
    const cookieStr = document.cookie || '';
    const cookies: Record<string,string> = Object.fromEntries(cookieStr.split(';').map(c=>c.trim()).filter(Boolean).map(p=>{ const i=p.indexOf('='); const k=i===-1?p:p.slice(0,i); const v=i===-1?'':decodeURIComponent(p.slice(i+1)); return [k,v]; }));
    const role = cookies['role'] || '';
    return can(role,'bot_factory');
  } catch { return false; }
}
