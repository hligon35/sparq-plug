'use client';

import Link from 'next/link';
import SignedInLogout from './SignedInLogout';

type Props = {
  title: string;
  subtitle?: string;
  onSecurityClick?: () => void; // kept for backward compatibility; no longer rendered
};

export default function AdminHeader({ title, subtitle, onSecurityClick: _onSecurityClick }: Props) {

  return (
    <div className="bg-[#1d74d0] text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* 3-col grid to keep title centered regardless of left/right content widths */}
        <div className="grid grid-cols-3 items-center">
          {/* Left */}
          <div className="flex items-center gap-2">
            <Link
              href={'https://portal.getsparqd.com/'}
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d74d0]"
            >
              <span aria-hidden>←</span>
              <span>Back to Portal</span>
            </Link>
          </div>

          {/* Centered Title */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="text-white/85 text-sm mt-1">{subtitle}</p>}
          </div>

          {/* Right: Uniform Signed In/Logout with timestamp */}
          <div className="flex items-center justify-end gap-2">
            <SignedInLogout />
          </div>
        </div>
      </div>
    </div>
  );
}
