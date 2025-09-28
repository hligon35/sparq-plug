"use client";

import { useState } from 'react';
import ClientHeader from '@/components/ClientHeader';
import ClientTopNav from '@/components/ClientTopNav';
import TrendingTopics from '@/components/TrendingTopics';
import ABTesting from '@/components/ABTesting';

export default function ContentPostsPage() {
  const [activeTab, setActiveTab] = useState('published');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const publishedPosts = [
    { 
      id: 1, 
      content: 'New product launch! 🚀 Excited to share our latest innovation with you all.',
      platforms: ['Facebook', 'Instagram', 'LinkedIn'],
      publishedAt: '2 hours ago',
      engagement: { likes: 145, comments: 23, shares: 8 },
      reach: 12500,
      status: 'published'
    },
    { 
      id: 2, 
      content: 'Behind the scenes at our office! Our team working hard to bring you amazing products.',
      platforms: ['Instagram', 'Facebook'],
      publishedAt: '4 hours ago',
      engagement: { likes: 89, comments: 12, shares: 5 },
      reach: 8300,
      status: 'published'
    },
    { 
      id: 3, 
      content: 'Industry insights: The future of technology and how it impacts your business.',
      platforms: ['LinkedIn', 'Twitter/X'],
      publishedAt: '1 day ago',
      engagement: { likes: 67, comments: 15, shares: 12 },
      reach: 9800,
      status: 'published'
    }
  ];

  const scheduledPosts = [
    {
      id: 4,
      content: 'Weekly motivation Monday! Start your week with positive energy.',
      platforms: ['Instagram', 'Facebook'],
      scheduledFor: 'Tomorrow 9:00 AM',
      status: 'scheduled'
    },
    {
      id: 5,
      content: 'Customer success story: How TechCorp increased their productivity by 150%.',
      platforms: ['LinkedIn', 'Facebook'],
      scheduledFor: 'Tomorrow 2:00 PM',
      status: 'scheduled'
    },
    {
      id: 6,
      content: 'Industry news update: Latest trends in social media marketing.',
      platforms: ['Twitter/X', 'LinkedIn'],
      scheduledFor: 'Wed 11:00 AM',
      status: 'scheduled'
    }
  ];

  const draftPosts = [
    {
      id: 7,
      content: 'Weekend vibes! What are your plans for the weekend?',
      platforms: ['Instagram', 'Facebook'],
      lastEdited: '1 hour ago',
      status: 'draft'
    },
    {
      id: 8,
      content: 'Announcing our partnership with innovative companies...',
      platforms: ['LinkedIn'],
      lastEdited: '3 hours ago',
      status: 'draft'
    }
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

  const currentPosts = activeTab === 'published' ? publishedPosts : 
                     activeTab === 'scheduled' ? scheduledPosts : draftPosts;

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
  <ClientHeader title="SparQ Content Management" subtitle="Create, Edit & Manage Your Social Media Content" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ClientTopNav />
      </div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Content & Posts</h2>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
          >
            Create New Post
          </button>
        </div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Content & Posts</h2>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
            >
              Create New Post
            </button>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Total Posts</h3>
              <p className="text-3xl font-bold mt-2">156</p>
              <p className="text-purple-100 text-sm mt-1">This month</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Published</h3>
              <p className="text-3xl font-bold mt-2">142</p>
              <p className="text-green-100 text-sm mt-1">91% success rate</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Scheduled</h3>
              <p className="text-3xl font-bold mt-2">12</p>
              <p className="text-blue-100 text-sm mt-1">Next 7 days</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium text-white/90">Drafts</h3>
              <p className="text-3xl font-bold mt-2">8</p>
              <p className="text-orange-100 text-sm mt-1">Pending review</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['published', 'scheduled', 'drafts'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} Posts
                  </button>
                ))}
              </nav>
            </div>

            {/* Posts List */}
            <div className="p-6">
              <div className="space-y-4">
                {currentPosts.map((post) => (
                  <div key={post.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 mb-3">{post.content}</p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Platforms:</span>
                            <div className="flex space-x-1">
                              {post.platforms.map((platform) => (
                                <span
                                  key={platform}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getPlatformColor(platform)}`}
                                >
                                  {getPlatformIcon(platform)} {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {activeTab === 'published' && 'publishedAt' in post && (
                              <span>Published {post.publishedAt}</span>
                            )}
                            {activeTab === 'scheduled' && 'scheduledFor' in post && (
                              <span>Scheduled for {post.scheduledFor}</span>
                            )}
                            {activeTab === 'drafts' && 'lastEdited' in post && (
                              <span>Last edited {post.lastEdited}</span>
                            )}
                          </div>
                          
                          {activeTab === 'published' && 'engagement' in post && post.engagement && (
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>❤️ {post.engagement.likes}</span>
                              <span>💬 {post.engagement.comments}</span>
                              <span>🔄 {post.engagement.shares}</span>
                              {'reach' in post && (
                                <span>👁️ {post.reach?.toLocaleString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <button className="text-gray-400 hover:text-gray-600 p-2" aria-label="Post options" title="Post options">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
  </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Create New Post</h2>
                  <button
                  onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close create post modal"
                    title="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Post Content</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="What's on your mind?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Platforms</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Facebook', 'Instagram', 'Twitter/X', 'LinkedIn'].map((platform) => (
                      <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                        <span className="text-sm text-gray-700">{getPlatformIcon(platform)} {platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                    Save as Draft
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Publish Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Intelligence Widgets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <TrendingTopics />
        <ABTesting />
      </div>
    </div>
  );
}
