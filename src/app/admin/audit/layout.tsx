"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AuditSectionLayout({ children }: { children: React.ReactNode }) {
  console.log('[AUDIT_SECTION_LAYOUT_VERSION] 2025-09-29T00:05Z v1');
  return (
    <div className="space-y-6" aria-label="Audit section">
      <SubNav />
      <div>{children}</div>
    </div>
  );
}

function SubNav() {
  const pathname = usePathname();
  const base = '/admin/audit';
  const links = [ { href: base, label: 'Overview' }, { href: base + '/logs', label: 'Logs' } ];
  return (
    <nav aria-label="Audit section" className="border-b border-slate-200">
      <ul className="flex gap-6 -mb-px text-sm font-medium">
        {links.map(l => { const active = pathname === l.href; return (
          <li key={l.href}>
            <Link href={l.href} className={['inline-block py-2.5 px-1 border-b-2 transition-colors', active ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-600 hover:text-slate-900'].join(' ')}>{l.label}</Link>
          </li>
        ); })}
      </ul>
    </nav>
  );
}