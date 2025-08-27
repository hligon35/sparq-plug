'use client';

import { useState } from 'react';
import Notifications from '@/components/Notifications';
import Header from '@/components/Header';
import ClientTopNav from '@/components/ClientTopNav';

export default function ClientDashboard() {
  // Mock data for client dashboard
  const accountStats = {
    totalPosts: 156,
    totalReach: 45200,
    totalEngagement: 3420,
    totalFollowers: 12800
  };

  const platformData = [
    { platform: 'Facebook', followers: 4200, posts: 45, engagement: 1250, reach: 15600 },
    { platform: 'Instagram', followers: 3800, posts: 38, engagement: 980, reach: 12400 },
    { platform: 'Twitter/X', followers: 2900, posts: 52, engagement: 740, reach: 9800 },
    { platform: 'LinkedIn', followers: 1900, posts: 21, engagement: 450, reach: 7400 }
  ];

  const recentPosts = [
    { id: 1, platform: 'Instagram', content: 'New product launch! 🚀', date: '2 hours ago', likes: 145, comments: 23, shares: 8 },
    { id: 2, platform: 'Facebook', content: 'Behind the scenes at our office', date: '4 hours ago', likes: 89, comments: 12, shares: 5 },
    { id: 3, platform: 'Twitter/X', content: 'Exciting news coming soon...', date: '6 hours ago', likes: 67, comments: 8, shares: 15 },
    { id: 4, platform: 'LinkedIn', content: 'Industry insights and trends', date: '1 day ago', likes: 34, comments: 6, shares: 12 }
  ];

  const upcomingPosts = [
    { id: 1, platform: 'Instagram', content: 'Weekly motivation Monday', scheduledFor: 'Tomorrow 9:00 AM', status: 'Scheduled' },
    { id: 2, platform: 'Facebook', content: 'Customer success story', scheduledFor: 'Tomorrow 2:00 PM', status: 'Scheduled' },
    { id: 3, platform: 'Twitter/X', content: 'Industry news update', scheduledFor: 'Wed 11:00 AM', status: 'Draft' }
  ];

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      'Facebook': '📘',
      'Instagram': '📷',
      'Twitter/X': '🐦',
      'LinkedIn': '💼'
    };
    return icons[platform] || '📱';
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      'Facebook': 'bg-blue-500',
      'Instagram': 'bg-pink-500',
      'Twitter/X': 'bg-sky-400',
      'LinkedIn': 'bg-blue-700'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Header title="SparQ Client Portal" subtitle="Manage Your Social Media Presence" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ClientTopNav />
      </div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select time range"
                title="Time range"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Create Post
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Posts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{accountStats.totalPosts}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </div>
                </div>
                <p className="text-green-600 text-sm mt-2">+12% from last period</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Reach</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{accountStats.totalReach.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-green-600 text-sm mt-2">+8% from last period</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Engagement</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{accountStats.totalEngagement.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                  </div>
                </div>
                <p className="text-green-600 text-sm mt-2">+15% from last period</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Followers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{accountStats.totalFollowers.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-green-600 text-sm mt-2">+5% from last period</p>
              </div>
            </div>

            {/* Notifications */}
            <Notifications />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Platform Performance */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {platformData.map((platform, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 ${getPlatformColor(platform.platform)} rounded-lg flex items-center justify-center`}>
                              <span className="text-white text-lg">{getPlatformIcon(platform.platform)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{platform.platform}</p>
                              <p className="text-sm text-gray-600">{platform.followers.toLocaleString()} followers</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Posts: {platform.posts}</p>
                            <p className="text-sm text-gray-600">Engagement: {platform.engagement}</p>
                            <p className="text-sm text-gray-600">Reach: {platform.reach.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                {/* Recent Posts */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {recentPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm">{getPlatformIcon(post.platform)}</span>
                          <span className="text-xs text-gray-500">{post.platform}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{post.date}</span>
                        </div>
                        <p className="text-sm text-gray-900 mb-2">{post.content}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments}</span>
                          <span>🔄 {post.shares}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Posts */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Posts</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    {upcomingPosts.map((post) => (
                      <div key={post.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm">{getPlatformIcon(post.platform)}</span>
                          <span className="text-xs text-gray-500">{post.platform}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            post.status === 'Scheduled' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-1">{post.content}</p>
                        <p className="text-xs text-gray-500">{post.scheduledFor}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Chart Placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Engagement Analytics</h3>
              </div>
              <div className="p-6">
                <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">Analytics Chart</p>
                    <p className="text-gray-400 text-sm">Engagement metrics and performance trends will be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}