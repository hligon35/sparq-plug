'use client';

import { useState } from 'react';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('7d');
  
  const analyticsData = {
    totalReach: '2.4M',
    engagement: '15.2%',
    newFollowers: '+8,245',
    clicks: '12.3K'
  };

  const topPosts = [
    { id: 1, content: 'New product launch announcement!', platform: 'Instagram', engagement: '24.5%', reach: '45.2K' },
    { id: 2, content: 'Behind the scenes content...', platform: 'Facebook', engagement: '18.7%', reach: '32.1K' },
    { id: 3, content: 'Weekly promotion post', platform: 'Twitter/X', engagement: '12.3%', reach: '28.9K' }
  ];

  // Top nav handles routing via links; no sidebar anymore

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Analytics & Reports" subtitle="Track performance across all your social platforms" />

      {/* Centered content with top nav pills */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          {/* Main Content */}
          <div className="">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{analyticsData.totalReach}</div>
                <div className="text-white/90 text-sm font-medium">Total Reach</div>
                <div className="text-white/70 text-xs mt-1">+12.5% vs last period</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{analyticsData.engagement}</div>
                <div className="text-white/90 text-sm font-medium">Avg Engagement</div>
                <div className="text-white/70 text-xs mt-1">+2.3% vs last period</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{analyticsData.newFollowers}</div>
                <div className="text-white/90 text-sm font-medium">New Followers</div>
                <div className="text-white/70 text-xs mt-1">+18.7% vs last period</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{analyticsData.clicks}</div>
                <div className="text-white/90 text-sm font-medium">Total Clicks</div>
                <div className="text-white/70 text-xs mt-1">+8.1% vs last period</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Engagement Trend</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  <p className="text-sm font-medium">Line Chart</p>
                  <p className="text-xs">Engagement over time</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Platform Performance</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">Pie Chart</p>
                  <p className="text-xs">Performance by platform</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Posts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800">Top Performing Posts</h3>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reach</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{post.content}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          post.platform === 'Facebook' ? 'bg-blue-100 text-blue-800' :
                          post.platform === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                          post.platform === 'Twitter/X' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {post.platform}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.engagement}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.reach}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
