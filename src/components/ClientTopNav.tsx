"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

const tabs = [
  { key: 'dashboard', label: 'Dashboard', href: '/client' },
  { key: 'content', label: 'Content', href: '/client/content' },
  { key: 'calendar', label: 'Calendar', href: '/client/calendar' },
  { key: 'analytics', label: 'Analytics', href: '/client/analytics' },
  { key: 'social-accounts', label: 'Social Accounts', href: '/client/social-accounts' },
  { key: 'inbox', label: 'Inbox', href: '/client/inbox' },
  // Email unified inbox preview (feature-flag aware client could optionally hide; left unconditional for visibility)
  { key: 'email', label: 'Email', href: '/client/email' },
  { key: 'media-library', label: 'Media', href: '/client/media-library' },
  { key: 'team', label: 'Team', href: '/client/team' },
  { key: 'billing', label: 'Billing', href: '/client/billing' },
  { key: 'settings', label: 'Settings', href: '/client/settings' },
];

export default function ClientTopNav() {
  const pathname = usePathname() ?? '';
  const activeKey = (() => {
    const idx = pathname.indexOf('/client');
    if (idx === -1) return 'dashboard';
    const after = pathname.slice(idx + '/client'.length);
    const seg = after.split('/').filter(Boolean)[0];
    return seg ?? 'dashboard';
  })();

  // Refs & state for custom scroll behaviour
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const dragState = React.useRef<{ startX: number; startScroll: number } | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const velocityRef = React.useRef(0);
  const hoveringLinkRef = React.useRef(false);

  // Touch / pointer swipe (only for touch pointer types)
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType !== 'touch') return; // only swipe on touch devices
      if (!el) return;
      dragState.current = { startX: e.clientX, startScroll: el.scrollLeft };
      setDragging(true);
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    function onPointerMove(e: PointerEvent) {
      if (e.pointerType !== 'touch') return;
      if (!dragState.current) return;
      if (!el) return;
      const dx = e.clientX - dragState.current.startX;
      el.scrollLeft = dragState.current.startScroll - dx; // inverse for natural swipe
    }
    function onPointerUp(e: PointerEvent) {
      if (e.pointerType !== 'touch') return;
      dragState.current = null;
      setDragging(false);
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  // Desktop hover auto-slide near edges
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

  const EDGE_PX = 96; // widened activation zone for earlier engagement
  const MAX_VELOCITY = 22; // px per frame (slightly higher for snappier feel)

    function step() {
      const v = velocityRef.current;
      if (v !== 0 && el) {
        el.scrollLeft += v;
        if (el.scrollLeft <= 0 && v < 0) velocityRef.current = 0;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll && v > 0) velocityRef.current = 0;
      }
      if (velocityRef.current !== 0) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    }

    function ensureLoop() {
      if (rafRef.current == null && velocityRef.current !== 0) {
        rafRef.current = requestAnimationFrame(step);
      }
    }

    function onMouseMove(e: MouseEvent) {
      // Skip if a touch drag is in progress
      if (dragging) return;
      if (matchMedia('(pointer: coarse)').matches) return; // don't run on touch devices
  if (!el) return;
  const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      let vel = 0;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= maxScroll - 2; // tolerance

      // Compute raw velocity (linear scaling) regardless of hover; we'll dampen later if needed
      if (x < EDGE_PX && !atStart) {
        const f = 1 - Math.max(0, x) / EDGE_PX; // 0..1
        vel = -Math.round(f * MAX_VELOCITY);
      } else if (x > rect.width - EDGE_PX && !atEnd) {
        const f = 1 - (rect.width - x) / EDGE_PX; // 0..1
        vel = Math.round(f * MAX_VELOCITY);
      }

      // Minimum base velocity when inside activation & scroll still possible
      if (vel !== 0) {
        const min = 2; // px/frame baseline
        if (Math.abs(vel) < min) vel = vel < 0 ? -min : min;
      }

      // If hovering a link and NOT inside edge activation zone, pause
      const inEdge = x < EDGE_PX || x > rect.width - EDGE_PX;
      if (hoveringLinkRef.current && !inEdge) vel = 0;
      // Prevent re-trigger at extremes
      if ((atEnd && vel > 0) || (atStart && vel < 0)) vel = 0;
      velocityRef.current = vel;
      ensureLoop();
    }
    function onMouseLeave() {
      velocityRef.current = 0;
    }

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dragging]);

  // Utility class for scrollbar hiding (cross-browser attempt)
  const hideScrollbar = 'scrollbar-thin scrollbar-transparent';

  return (
    <div className="mb-6">
      <div
        ref={containerRef}
        className={`relative select-none overflow-hidden group rounded-xl bg-transparent`}
        aria-label="Client navigation"
      >
        <nav
          className={`flex items-center gap-3 p-2 min-w-max will-change-transform ${hideScrollbar}`}
          aria-label="Navigation tabs"
        >
          {tabs.map((t) => {
            const isActive = activeKey === (t.key === 'dashboard' ? undefined : t.key) || (t.key === 'dashboard' && activeKey === 'dashboard');
            return (
              <Link
                key={t.key}
                href={t.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm ${
                  isActive
                    ? 'bg-white text-blue-700 border-blue-200 shadow-md ring-1 ring-blue-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:shadow-md hover:-translate-y-[1px]'
                } ${dragging ? 'pointer-events-none' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={() => { hoveringLinkRef.current = true; velocityRef.current = 0; }}
                onMouseLeave={() => { hoveringLinkRef.current = false; }}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`} />
                {t.label}
              </Link>
            );
          })}
        </nav>
        {/* Edge gradients (visual hint) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#f5f7fb] to-transparent opacity-70" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#f5f7fb] to-transparent opacity-70" />
      </div>
    </div>
  );
}
