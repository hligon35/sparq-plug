'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  title: string;
  subtitle?: string;
  onSecurityClick?: () => void; // kept for backward compatibility; no longer rendered
};

export default function AdminHeader({ title, subtitle, onSecurityClick: _onSecurityClick }: Props) {
  const router = useRouter();

  const logout = () => {
    document.cookie = 'role=; Path=/; Max-Age=0; SameSite=Lax';
    router.push('/login');
  };

  return (
    <div className="bg-[#1d74d0] text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 3-col grid to keep title centered regardless of left/right content widths */}
        <div className="grid grid-cols-3 items-center">
          {/* Left */}
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden sm:inline text-white/90 hover:text-white text-sm">Back to Portal</Link>
          </div>

          {/* Centered Title */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="text-white/85 text-sm mt-1">{subtitle}</p>}
          </div>

          {/* Right: Combined Signed In + Logout button */}
          <div className="flex items-center justify-end gap-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}
