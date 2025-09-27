"use client";
import nextDynamic from 'next/dynamic';
import Link from 'next/link';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerTopNav from '@/components/ManagerTopNav';
import ManagerSectionBanner from '@/components/ManagerSectionBanner';
import { managerRouteMap } from '@/lib/managerNav';

const MultiClientPlanner = nextDynamic(() => import('@/components/MultiClientPlanner'), { ssr: false });

export const dynamic = 'force-dynamic'; // Next.js segment option

export default function ManagerUnifiedPlannerPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <ManagerHeader title="SparQ Plug" subtitle="Unified Client Planner" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManagerTopNav
          active={'clients'}
          onChange={(k) => {
            if (k === 'clients') return; // remain on clients section
            window.location.href = managerRouteMap[k];
          }}
        />
        <div className="p-1">
          <ManagerSectionBanner
            icon="📅"
            variant="purple"
            title="Unified Planner"
            subtitle="Cross-client visibility across your entire managed portfolio"
            actions={
              <Link
                href="/manager/client-calendars"
                className="bg-white/15 hover:bg-white/25 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Client Calendars →
              </Link>
            }
          />
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">Portfolio View</h2>
              </div>
              <p className="text-sm text-gray-500 max-w-sm">Filter by single client or scan all upcoming posts in one calendar.</p>
            </div>
            <MultiClientPlanner managerScope />
          </div>
        </div>
      </div>
    </div>
  );
}
