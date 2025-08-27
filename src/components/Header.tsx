"use client";

import SignedInLogout from './SignedInLogout';

type Props = { title: string; subtitle?: string };

// Client header unified with admin styling (blue theme, centered title, right-aligned auth control)
export default function Header({ title, subtitle }: Props) {
  return (
    <header className="w-full bg-[#1d74d0] text-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-3 items-center">
        <div className="text-sm text-white/80">&nbsp;</div>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="text-white/85 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center justify-end">
          <SignedInLogout />
        </div>
      </div>
    </header>
  );
}
