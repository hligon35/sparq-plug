"use client";

import { useState } from 'react';
import Header from '@/components/Header';
import ClientTopNav from '@/components/ClientTopNav';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const overviewStats = {
    totalReach: 125400,
    totalEngagement: 8250,
    totalFollowers: 15600,
    engagementRate: 6.58
  };

  const platformStats = [
    { platform: 'Facebook', followers: 5200, posts: 45, engagement: 2850, reach: 45600, growthRate: 12.5 },
    { platform: 'Instagram', followers: 4800, posts: 38, engagement: 2180, reach: 38400, growthRate: 18.3 },
    { platform: 'Twitter/X', followers: 3200, posts: 52, engagement: 1620, reach: 24800, growthRate: 8.7 },
    { platform: 'LinkedIn', followers: 2400, posts: 21, engagement: 1600, reach: 16600, growthRate: 15.2 }
  ];

  const topPosts = [
    {
      id: 1,
      content: 'New product launch announcement! 🚀',
      platform: 'Instagram',
      engagement: 485,
      reach: 12500,
      date: '3 days ago'
    },
    {
      id: 2,
      content: 'Behind the scenes: Our team in action',
      platform: 'Facebook',
      engagement: 342,
      reach: 9800,
      date: '5 days ago'
    },
    {
      id: 3,
      content: 'Industry insights and future trends',
      platform: 'LinkedIn',
      engagement: 298,
      reach: 8600,
      date: '1 week ago'
    }
  ];

  const audienceInsights = {
    ageGroups: [
      { range: '18-24', percentage: 18 },
      { range: '25-34', percentage: 35 },
      { range: '35-44', percentage: 28 },
      { range: '45-54', percentage: 12 },
      { range: '55+', percentage: 7 }
    ],
    topLocations: [
      { country: 'United States', percentage: 45 },
      { country: 'Canada', percentage: 18 },
      { country: 'United Kingdom', percentage: 12 },
      { country: 'Australia', percentage: 8 },
      { country: 'Germany', percentage: 6 }
    ],
    gender: [
      { type: 'Female', percentage: 52 },
      { type: 'Male', percentage: 46 },
      { type: 'Other', percentage: 2 }
    ]
  };

  const engagementData = [
    { day: 'Mon', likes: 180, comments: 45, shares: 23 },
    { day: 'Tue', likes: 220, comments: 52, shares: 31 },
    { day: 'Wed', likes: 195, comments: 38, shares: 19 },
    { day: 'Thu', likes: 240, comments: 61, shares: 35 },
    { day: 'Fri', likes: 285, comments: 73, shares: 42 },
    { day: 'Sat', likes: 310, comments: 82, shares: 48 },
    { day: 'Sun', likes: 265, comments: 68, shares: 38 }
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
      'LinkedIn': 'bg-blue-700',
    };
    return colors[platform] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Header title="SparQ Analytics Dashboard" subtitle="Track Performance & Gain Insights" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ClientTopNav />
      </div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Analytics & Reports</h2>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Platforms</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter/X</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Export Report
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-medium text-white/90">Total Reach</h3>
            <p className="text-3xl font-bold mt-2">{overviewStats.totalReach.toLocaleString()}</p>
            <p className="text-blue-100 text-sm mt-1">+15% from last period</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-medium text-white/90">Total Engagement</h3>
            <p className="text-3xl font-bold mt-2">{overviewStats.totalEngagement.toLocaleString()}</p>
            <p className="text-green-100 text-sm mt-1">+23% from last period</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-medium text-white/90">Total Followers</h3>
            <p className="text-3xl font-bold mt-2">{overviewStats.totalFollowers.toLocaleString()}</p>
            <p className="text-purple-100 text-sm mt-1">+8% from last period</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-medium text-white/90">Engagement Rate</h3>
            <p className="text-3xl font-bold mt-2">{overviewStats.engagementRate}%</p>
            <p className="text-orange-100 text-sm mt-1">+1.2% from last period</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Engagement Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Weekly Engagement Trends</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {engagementData.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <div className="w-full space-y-1 flex flex-col justify-end" style={{ height: '200px' }}>
                    <div 
                      className="bg-blue-500 rounded-t w-full"
                      style={{ height: `${(day.likes / 350) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-green-500 w-full"
                      style={{ height: `${(day.comments / 350) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-orange-500 rounded-b w-full"
                      style={{ height: `${(day.shares / 350) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Likes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Comments</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">Shares</span>
              </div>
            </div>
          </div>

          {/* Platform Performance */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Platform Performance</h3>
            <div className="space-y-4">
              {platformStats.map((platform, index) => (
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
                    <p className="text-sm font-medium text-gray-900">+{platform.growthRate}%</p>
                    <p className="text-xs text-gray-600">growth</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Performing Posts */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Performing Posts</h3>
            <div className="space-y-4">
              {topPosts.map((post) => (
                <div key={post.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm">{getPlatformIcon(post.platform)}</span>
                    <span className="text-xs text-gray-500">{post.platform}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{post.content}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>💬 {post.engagement}</span>
                    <span>👁️ {post.reach.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Audience Demographics</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Age Groups</h4>
              <div className="space-y-2">
                {audienceInsights.ageGroups.map((group) => (
                  <div key={group.range} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{group.range}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full"
                          style={{ width: `${group.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{group.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Gender Distribution</h4>
              <div className="space-y-2">
                {audienceInsights.gender.map((g) => (
                  <div key={g.type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{g.type}</span>
                    <span className="text-sm font-medium text-gray-900">{g.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Locations</h3>
            <div className="space-y-3">
              {audienceInsights.topLocations.map((location, index) => (
                <div key={location.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
                    <span className="text-sm text-gray-600">{location.country}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{location.percentage}%</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-pink-50 rounded-lg">
              <h4 className="text-sm font-medium text-pink-800 mb-2">Growth Opportunity</h4>
              <p className="text-sm text-pink-700">
                Consider targeting European markets where you have less presence but high engagement potential.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
