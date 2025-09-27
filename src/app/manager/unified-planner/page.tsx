"use client";
import nextDynamic from 'next/dynamic';
import Link from 'next/link';

const MultiClientPlanner = nextDynamic(() => import('@/components/MultiClientPlanner'), { ssr: false });

export const dynamic = 'force-dynamic'; // Next.js segment option

export default function ManagerUnifiedPlannerPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Unified Client Planner</h1>
              <p className="text-gray-600">Cross-client visibility for your assigned portfolio</p>
            </div>
            <Link href="/manager/client-calendars" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Client Calendars →</Link>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
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
