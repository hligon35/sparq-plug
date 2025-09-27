"use client";

import AdminHeader from '@/components/AdminHeader';
import AdminTopNav from '@/components/AdminTopNav';
import AnalyticsSubNav from '@/components/AnalyticsSubNav';
import Link from 'next/link';

export default function AnalyticsOverviewPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Analytics & Reports" subtitle="Unified performance overview" />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          <AnalyticsSubNav />
          <div className="grid md:grid-cols-2 gap-8 mt-2">
            <AnalyticsCard
              title="Social Analytics"
              description="Reach, engagement, follower growth and top-performing social content across all connected platforms."
              href="/admin/analytics/socials"
              accent="blue"
              stats={[{ label: 'Global Reach', value: '2.4M' }, { label: 'Avg Engagement', value: '15.2%' }]}
            />
            <AnalyticsCard
              title="Website Analytics"
              description="Traffic, visitor quality, conversion performance and page speed across managed client sites."
              href="/admin/analytics/sites"
              accent="green"
              stats={[{ label: 'Total Views', value: '659K' }, { label: 'Avg Conv Rate', value: '2.7%' }]}
            />
            <AnalyticsCard
              title="Revenue Analytics"
              description="Subscription & service revenue trends, monthly gross, client monetization performance."
              href="/admin/analytics/revenue"
              accent="purple"
              stats={[{ label: 'MTD Gross', value: '$42.3K' }, { label: 'QTD', value: '$128K' }]}
            />
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">Combined Insights <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Preview</span></h3>
                <p className="text-sm text-gray-600 mb-4">Future unified dashboard blending social, website & revenue KPIs into a single snapshot.</p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                  <li>Cross-channel engagement vs on-site conversions</li>
                  <li>Attribution-ready funnel metrics</li>
                  <li>Automated anomaly detection</li>
                </ul>
              </div>
              <div className="mt-6">
                <Link href="/admin/reports" className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-900">
                  Go to Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ title, description, href, accent, stats }: { title: string; description: string; href: string; accent: string; stats: { label: string; value: string; }[]; }) {
  const colorMap: Record<string,string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[accent]} flex items-center justify-center text-white text-lg font-semibold`}>{title.slice(0,1)}</div>
      </div>
      <p className="text-sm text-gray-600 mb-4 flex-1">{description}</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map(s => (
          <div key={s.label} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-sm font-semibold text-gray-800">{s.value}</div>
          </div>
        ))}
      </div>
      <Link
        href={href}
        aria-label={`Open ${title}`}
        className="self-start inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Open
        <span aria-hidden>↗</span>
      </Link>
    </div>
  );
}

