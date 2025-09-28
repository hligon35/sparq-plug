"use client";
import { ReactNode, useEffect, useState } from 'react';
import { can } from '@/lib/roles';

export default function RequireCapability({ capability, children, fallback }: { capability: string; children: ReactNode; fallback?: ReactNode; }) {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const cookieStr = typeof document !== 'undefined' ? document.cookie : '';
    const cookies: Record<string,string> = Object.fromEntries(cookieStr.split(';').map(c=>c.trim()).filter(Boolean).map(c=>{ const i=c.indexOf('='); return [c.slice(0,i), decodeURIComponent(c.slice(i+1))]; }));
    setRole(cookies['role'] || null);
  }, []);
  if (!can(role, capability)) return <>{fallback || <div className="p-6 text-sm text-red-600">Access denied: missing capability <code className="font-mono">{capability}</code>.</div>}</>;
  return <>{children}</>;
}
