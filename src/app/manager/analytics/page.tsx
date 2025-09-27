'use client';

import { useState, useEffect } from 'react';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerTopNav from '@/components/ManagerTopNav';
import KpiCard from '@/components/KpiCard';
import ManagerSectionBanner from '@/components/ManagerSectionBanner';

interface AnalyticsData {
  totalClients: number;
  activeProjects: number;
  monthlyRevenue: number;
  clientSatisfaction: number;
  topPerformingClients: Array<{
    id: string;
    name: string;
    revenue: number;
    growth: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

const mockAnalytics: AnalyticsData = {
  totalClients: 24,
  activeProjects: 47,
  monthlyRevenue: 45600,
  clientSatisfaction: 4.8,
  topPerformingClients: [
    { id: '1', name: 'TechCorp Solutions', revenue: 12500, growth: 15.2 },
    { id: '2', name: 'Fitness Studio Plus', revenue: 8900, growth: 23.1 },
    { id: '3', name: 'Restaurant Chain Co', revenue: 7800, growth: 8.7 },
    { id: '4', name: 'Fashion Boutique', revenue: 6200, growth: 12.4 },
    { id: '5', name: 'Healthcare Partners', revenue: 5400, growth: 18.9 }
  ],
  revenueByMonth: [
    { month: 'Jan', revenue: 38000 },
    { month: 'Feb', revenue: 41000 },
    { month: 'Mar', revenue: 39500 },
    { month: 'Apr', revenue: 43200 },
    { month: 'May', revenue: 44800 },
    { month: 'Jun', revenue: 42300 },
    { month: 'Jul', revenue: 45100 },
    { month: 'Aug', revenue: 47200 },
    { month: 'Sep', revenue: 45600 }
  ]
};

export default function ManagerAnalyticsPage() {
  const [activeTab] = useState<'dashboard' | 'invoices' | 'clients' | 'analytics' | 'settings' | 'tasks'>('analytics');
  const [timeRange, setTimeRange] = useState('6m');
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(()=> setLoading(false), 600); return ()=> clearTimeout(t); }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <ManagerHeader title="SparQ Plug" subtitle="Business Performance & Insights Dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManagerTopNav
          active={activeTab}
          onChange={(k) => {
            if (k === 'analytics') return;
            const map: Record<string,string> = {
              dashboard: '/manager',
              invoices: '/manager?tab=invoices',
              clients: '/manager/clients',
              settings: '/manager/settings',
              tasks: '/manager/tasks',
              analytics: '/manager/analytics'
            };
            window.location.href = map[k];
          }}
        />

        <div className="space-y-8">
          <ManagerSectionBanner
            icon="📊"
            title="Analytics Dashboard"
            subtitle="Performance insights and business metrics"
            variant="indigo"
            actions={
              <>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/50 text-sm"
                  title="Select time range"
                >
                  <option value="1m">Last Month</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                </select>
                <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/30 hover:bg-white/30 transition-colors text-sm font-medium">
                  Export Report
                </button>
              </>
            }
          />

          {/* Key Metrics (KPI Grid) */}
          <section aria-labelledby="manager-kpis">
            <h2 id="manager-kpis" className="sr-only">Key performance indicators</h2>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-hidden>
                {Array.from({ length: 4 }).map((_,i)=>(<div key={i} className="animate-pulse rounded-2xl h-32 bg-gradient-to-br from-gray-200 to-gray-300" />))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard gradient="blue" label="Total Clients" value={mockAnalytics.totalClients} delta="+12%" size="sm" />
                <KpiCard gradient="green" label="Active Projects" value={mockAnalytics.activeProjects} delta="+8%" size="sm" />
                <KpiCard gradient="purple" label="Monthly Revenue" value={`$${mockAnalytics.monthlyRevenue.toLocaleString()}`} delta="+15%" size="sm" />
                <KpiCard gradient="orange" label="Client Satisfaction" value={`${mockAnalytics.clientSatisfaction}/5.0`} delta="+0.2" size="sm" />
              </div>
            )}
          </section>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Revenue Trend</h3>
                <span className="text-sm text-gray-500">Last 9 months</span>
              </div>
              
              <div className="space-y-4">
                {mockAnalytics.revenueByMonth.map((data, index) => (
                  <div key={data.month} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                    <div className="flex-1">
                      <meter
                        min={0}
                        max={50000}
                        value={data.revenue}
                        className="w-full h-3"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-20">${data.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Clients */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Top Performing Clients</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
              </div>
              
              <div className="space-y-4">
                {mockAnalytics.topPerformingClients.map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">${client.revenue.toLocaleString()}/month</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                        client.growth > 15 ? 'bg-green-100 text-green-700' :
                        client.growth > 10 ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        +{client.growth}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Insights */}
          <section aria-labelledby="manager-secondary-kpis">
            <h2 id="manager-secondary-kpis" className="sr-only">Additional performance insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📊</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Client Retention</h4>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">94.2%</p>
                <p className="text-green-600 text-sm">+2.1% from last quarter</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">⚡</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Avg Response Time</h4>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">2.3h</p>
                <p className="text-green-600 text-sm">-0.5h improvement</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">📈</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Growth Rate</h4>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">23.7%</p>
                <p className="text-green-600 text-sm">+5.2% from last quarter</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}