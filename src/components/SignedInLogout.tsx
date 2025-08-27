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
    router.push('/login');
  };

  return (
    <div className={`flex flex-col items-end ${className || ''}`}>
      <button
        onClick={logout}
        className="inline-flex items-center gap-2 bg-white text-[#1d74d0] hover:bg-blue-50 px-3 py-2 rounded-full text-sm font-semibold shadow"
        aria-label={`${displayName} - Logout`}
        title={`Logout ${displayName}`}
      >
        <span aria-hidden>🧑</span>
        <span className="hidden sm:inline">{displayName} • Logout</span>
        <span className="sm:hidden">Logout</span>
      </button>
  <div className="w-full mt-1 text-[10px] leading-none text-white/80 text-center" aria-live="polite">{timestamp}</div>
    </div>
  );
}
