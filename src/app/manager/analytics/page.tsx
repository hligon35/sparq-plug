'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import ManagerTopNav from '@/components/ManagerTopNav';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'clients' | 'analytics' | 'settings'>('analytics');
  const [timeRange, setTimeRange] = useState('6m');

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Header title="Manager Analytics" subtitle="Business Performance & Insights Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManagerTopNav active={activeTab} onChange={setActiveTab} />
        
        <div className="space-y-8">
          {/* Page Header */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-3xl">📊</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                  <p className="text-white/80 text-lg mt-1">Performance insights and business metrics</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 focus:ring-2 focus:ring-white/50"
                  title="Select time range"
                >
                  <option value="1m">Last Month</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last Year</option>
                </select>
                <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-white/30 hover:bg-white/30 transition-colors">
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Clients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{mockAnalytics.totalClients}</p>
                  <p className="text-green-600 text-sm mt-1">+12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{mockAnalytics.activeProjects}</p>
                  <p className="text-green-600 text-sm mt-1">+8% from last month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-2xl">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${mockAnalytics.monthlyRevenue.toLocaleString()}</p>
                  <p className="text-green-600 text-sm mt-1">+15% from last month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-2xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Client Satisfaction</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{mockAnalytics.clientSatisfaction}/5.0</p>
                  <p className="text-green-600 text-sm mt-1">+0.2 from last month</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-yellow-600 text-2xl">⭐</span>
                </div>
              </div>
            </div>
          </div>

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
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(data.revenue / 50000) * 100}%` }}
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
        </div>
      </div>
    </div>
  );
}