"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  className?: string;
};

export default function SignedInLogout({ className }: Props) {
  const router = useRouter();
  const [timestamp, setTimestamp] = useState<string>(() => new Date().toLocaleString());
  const [displayName, setDisplayName] = useState<string>('Signed In');

  useEffect(() => {
    const id = setInterval(() => setTimestamp(new Date().toLocaleString()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Parse cookies and derive a display name
    const cookieStr = typeof document !== 'undefined' ? document.cookie || '' : '';
    const cookies: Record<string, string> = Object.fromEntries(
      cookieStr.split(';').map(c => c.trim()).filter(Boolean).map(pair => {
        const idx = pair.indexOf('=');
        const k = idx === -1 ? pair : pair.slice(0, idx);
        const v = idx === -1 ? '' : decodeURIComponent(pair.slice(idx + 1));
        return [k, v];
      })
    );
    const username = cookies['username'] || cookies['user'] || '';
    const role = cookies['role'] || '';
    const titleCase = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    const name = username || titleCase(role) || 'Signed In';
    setDisplayName(name);
  }, []);

  const logout = () => {
    // Clear role cookie and go to login
  document.cookie = 'role=; Path=/; Max-Age=0; SameSite=Lax';
  document.cookie = 'username=; Path=/; Max-Age=0; SameSite=Lax';
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  router.push(`${bp}/login`);
  };

  return (
    <div className={`relative flex items-center ${className || ''}`}>
      <button
        onClick={logout}
        className="inline-flex items-center h-10 gap-2 bg-white text-[#1d74d0] hover:bg-blue-50 px-3 rounded-full text-sm font-semibold shadow max-w-full"
        aria-label={`${displayName} - Logout`}
        title={`Logout ${displayName} • ${timestamp}`}
      >
        <span aria-hidden>🧑</span>
        <span className="hidden sm:inline truncate">{displayName} • Logout</span>
        <span className="sm:hidden">Logout</span>
      </button>
      <div
        className="absolute left-1/2 translate-x-[-50%] -bottom-3 sm:left-auto sm:right-0 sm:translate-x-0 text-[10px] leading-none text-white/80 whitespace-nowrap"
        aria-live="polite"
      >
        {timestamp}
      </div>
    </div>
  );
}
