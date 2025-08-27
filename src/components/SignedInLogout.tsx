"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  className?: string;
};

export default function SignedInLogout({ className }: Props) {
  const router = useRouter();
  const [timestamp, setTimestamp] = useState<string>(() => new Date().toLocaleString());

  useEffect(() => {
    const id = setInterval(() => setTimestamp(new Date().toLocaleString()), 60_000);
    return () => clearInterval(id);
  }, []);

  const logout = () => {
    // Clear role cookie and go to login
    document.cookie = 'role=; Path=/; Max-Age=0; SameSite=Lax';
    router.push('/login');
  };

  return (
    <div className={`flex flex-col items-end ${className || ''}`}>
      <button
        onClick={logout}
        className="inline-flex items-center gap-2 bg-white text-[#1d74d0] hover:bg-blue-50 px-3 py-2 rounded-full text-sm font-semibold shadow"
        aria-label="Signed in - Logout"
        title="Click to logout"
      >
        <span aria-hidden>🧑</span>
        <span className="hidden sm:inline">Signed In • Logout</span>
        <span className="sm:hidden">Logout</span>
      </button>
  <div className="w-full mt-1 text-[10px] leading-none text-white/80 text-center" aria-live="polite">{timestamp}</div>
    </div>
  );
}
