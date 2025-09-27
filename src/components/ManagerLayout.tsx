"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerTopNav from '@/components/ManagerTopNav';
import { managerRouteMap, ManagerTabKey, navigateManager } from '@/lib/managerNav';
import { useRouter } from 'next/navigation';

export interface ManagerLayoutProps {
  children: React.ReactNode;
  active: ManagerTabKey; // which tab should appear active in top nav
  headerTitle?: string;
  headerSubtitle?: string;
  /**
   * Optional override for navigation events. If omitted, default window.location navigation is used.
   * For dashboard/invoices internal toggling you can intercept and handle client-side.
   */
  onNavChange?: (tab: ManagerTabKey) => void;
  /** If true, skips rendering the header (rare cases). */
  hideHeader?: boolean;
}

export default function ManagerLayout({
  children,
  active,
  headerTitle = 'SparQ Plug',
  headerSubtitle,
  onNavChange,
  hideHeader
}: ManagerLayoutProps) {
  const router = useRouter();
  function handleChange(tab: ManagerTabKey) {
    if (tab === active) return;
    if (onNavChange) {
      onNavChange(tab);
      return;
    }
    // default full navigation with router for SPA experience
    navigateManager(tab, { router });
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {!hideHeader && (
        <ManagerHeader title={headerTitle} subtitle={headerSubtitle} />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManagerTopNav active={active} onChange={handleChange} />
        <div className="p-1">{children}</div>
      </div>
      {process.env.NEXT_PUBLIC_MANAGER_NAV_DEBUG === 'true' && (
        // Lazy load debug panel only when flag enabled (dev tooling)
        (() => {
          const Panel = dynamic(() => import('./ManagerNavDebugPanel'), { ssr: false });
          return <Panel />;
        })()
      )}
    </div>
  );
}
