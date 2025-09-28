"use client";

import { useState, useEffect } from 'react';
import ClientHeader from '@/components/ClientHeader';
import ClientTopNav from '@/components/ClientTopNav';
import KpiCard from '@/components/KpiCard';

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

  const [loading, setLoading] = useState(true);
  useEffect(()=>{ const t = setTimeout(()=> setLoading(false), 600); return ()=> clearTimeout(t); }, []);

  // Map numeric values to Tailwind height classes (approximation buckets) to avoid inline styles
  const barHeightClass = (value: number, max = 350) => {
    const pct = value / max; // 0..1
    const buckets = [0,0.06,0.12,0.18,0.24,0.30,0.36,0.42,0.48,0.54,0.60,0.66,0.72,0.78,0.84,0.90,0.96,1];
    const classes = ['h-0','h-2','h-3','h-4','h-5','h-6','h-8','h-9','h-10','h-12','h-14','h-16','h-20','h-24','h-28','h-32','h-44','h-52'];
    for (let i=buckets.length-1;i>=0;i--) {
      if (pct >= buckets[i]) return classes[i];
    }
    return 'h-0';
  };

  // Approximate width for age group percentage bars using fraction classes
  const percentWidthClass = (pct: number) => {
    if (pct >= 90) return 'w-full';
    if (pct >= 80) return 'w-11/12';
    if (pct >= 70) return 'w-10/12';
    if (pct >= 66) return 'w-2/3';
    if (pct >= 60) return 'w-7/12';
    if (pct >= 55) return 'w-6/12';
    if (pct >= 50) return 'w-1/2';
    if (pct >= 45) return 'w-5/12';
    if (pct >= 40) return 'w-1/3';
    if (pct >= 33) return 'w-4/12';
    if (pct >= 25) return 'w-3/12';
    if (pct >= 20) return 'w-1/5';
    if (pct >= 15) return 'w-2/12';
    if (pct >= 10) return 'w-1/6';
    if (pct >= 5) return 'w-1/12';
    return 'w-0';
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
  <ClientHeader title="SparQ Plug" subtitle="Track Performance & Gain Insights" />
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
              aria-label="Filter by platform"
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
              aria-label="Select time range"
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
        <section aria-labelledby="client-overview-kpis" className="mb-8">
          <h2 id="client-overview-kpis" className="sr-only">Overview key performance indicators</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-hidden>
              {Array.from({length:4}).map((_,i)=>(<div key={i} className="animate-pulse rounded-2xl h-32 bg-gradient-to-br from-gray-200 to-gray-300" />))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard gradient="blue" label="Total Reach" value={overviewStats.totalReach.toLocaleString()} delta="+15%" size="sm" />
              <KpiCard gradient="green" label="Total Engagement" value={overviewStats.totalEngagement.toLocaleString()} delta="+23%" size="sm" />
              <KpiCard gradient="purple" label="Total Followers" value={overviewStats.totalFollowers.toLocaleString()} delta="+8%" size="sm" />
              <KpiCard gradient="orange" label="Engagement Rate" value={`${overviewStats.engagementRate}%`} delta="+1.2%" size="sm" />
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Engagement Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Weekly Engagement Trends</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {engagementData.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <div className="w-full space-y-1 flex flex-col justify-end h-52" aria-label={`Engagement breakdown for ${day.day}`}>
                    <div className={`bg-blue-500 rounded-t w-full ${barHeightClass(day.likes)}`} aria-label={`Likes ${day.likes}`} />
                    <div className={`bg-green-500 w-full ${barHeightClass(day.comments)}`} aria-label={`Comments ${day.comments}`} />
                    <div className={`bg-orange-500 rounded-b w-full ${barHeightClass(day.shares)}`} aria-label={`Shares ${day.shares}`} />
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
                          className={`bg-pink-500 h-2 rounded-full ${percentWidthClass(group.percentage)}`}
                          aria-label={`${group.percentage}% in age range ${group.range}`}
                        />
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
