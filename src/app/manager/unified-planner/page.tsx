"use client";
import nextDynamic from 'next/dynamic';
import Link from 'next/link';
import ManagerSectionBanner from '@/components/ManagerSectionBanner';
import ManagerLayout from '@/components/ManagerLayout';

const MultiClientPlanner = nextDynamic(() => import('@/components/MultiClientPlanner'), { ssr: false });

export const dynamic = 'force-dynamic'; // Next.js segment option

export default function ManagerUnifiedPlannerPage() {
  return (
    <ManagerLayout active="clients" headerSubtitle="Unified Client Planner">
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
    </ManagerLayout>
  );
}
