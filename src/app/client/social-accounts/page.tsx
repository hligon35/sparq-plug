'use client';

import { useState } from 'react';

export default function SocialAccountsPage() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');

  const connectedAccounts = [
    {
      id: 1,
      platform: 'Facebook',
      accountName: 'TechCorp Official',
      handle: '@techcorp',
      followers: 12500,
      status: 'connected',
      lastSync: '2 minutes ago',
      posts: 145,
      engagement: 8.5
    },
    {
      id: 2,
      platform: 'Instagram',
      accountName: 'TechCorp',
      handle: '@techcorp',
      followers: 8900,
      status: 'connected',
      lastSync: '5 minutes ago',
      posts: 89,
      engagement: 12.3
    },
    {
      id: 3,
      platform: 'LinkedIn',
      accountName: 'TechCorp Solutions',
      handle: 'techcorp-solutions',
      followers: 5600,
      status: 'connected',
      lastSync: '1 hour ago',
      posts: 67,
      engagement: 6.8
    },
    {
      id: 4,
      platform: 'Twitter/X',
      accountName: 'TechCorp',
      handle: '@techcorp',
      followers: 7200,
      status: 'connected',
      lastSync: '30 minutes ago',
      posts: 234,
      engagement: 4.2
    }
  ];

  const availablePlatforms = [
    {
      platform: 'YouTube',
      description: 'Connect your YouTube channel to share video content',
      icon: '🎥',
      color: 'bg-red-500',
      status: 'available'
    },
    {
      platform: 'TikTok',
      description: 'Reach younger audiences with short-form video content',
      icon: '🎵',
      color: 'bg-black',
      status: 'available'
    },
    {
      platform: 'Pinterest',
      description: 'Share visual content and drive traffic to your website',
      icon: '📌',
      color: 'bg-red-600',
      status: 'available'
    },
    {
      platform: 'Snapchat',
      description: 'Engage with younger demographics through Stories',
      icon: '👻',
      color: 'bg-yellow-400',
      status: 'available'
    }
  ];

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      'Facebook': '📘',
      'Instagram': '📷',
      'Twitter/X': '🐦',
      'LinkedIn': '💼',
      'YouTube': '🎥',
      'TikTok': '🎵',
      'Pinterest': '📌',
      'Snapchat': '👻'
    };
    return icons[platform] || '📱';
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      'Facebook': 'bg-blue-500',
      'Instagram': 'bg-pink-500',
      'Twitter/X': 'bg-sky-400',
      'LinkedIn': 'bg-blue-700',
      'YouTube': 'bg-red-500',
      'TikTok': 'bg-black',
      'Pinterest': 'bg-red-600',
      'Snapchat': 'bg-yellow-400'
    };
    return colors[platform] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'syncing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNavClick = (section: string) => {
    if (section === '') {
      window.location.href = '/client';
    } else {
      window.location.href = `/client/${section}`;
    }
  };

  const handleConnectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const handleDisconnect = (accountId: number) => {
    if (confirm('Are you sure you want to disconnect this account?')) {
      alert('Account disconnected successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">🔗</span>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">SparQ Social Accounts</h1>
              <p className="text-white/80 text-sm mt-1">Manage Your Connected Social Media Platforms</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-3">
            <button 
              onClick={() => handleNavClick('')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <span className="font-medium">Dashboard</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavClick('content')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Content & Posts</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavClick('calendar')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Content Calendar</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavClick('analytics')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-pink-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <span className="font-medium">Analytics & Reports</span>
              </div>
            </button>

            <div className="bg-teal-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Social Accounts</span>
              </div>
            </div>

            <button 
              onClick={() => handleNavClick('inbox')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-indigo-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <span className="font-medium">Social Inbox</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavClick('media-library')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Media Library</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavClick('team')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-cyan-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <span className="font-medium">Team & Collaboration</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavClick('billing')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-orange-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h6zM4 14a2 2 0 002 2h8a2 2 0 002-2v-2H4v2z" />
                  </svg>
                </div>
                <span className="font-medium">Billing & Plans</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavClick('settings')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </div>
                <span className="font-medium">Account Settings</span>
              </div>
            </button>
          </nav>

          {/* Account Summary */}
          <div className="mt-8 space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Connected Accounts</h3>
              <p className="text-2xl font-bold text-gray-900">{connectedAccounts.length}</p>
              <p className="text-sm text-gray-600">Active platforms</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Followers</h3>
              <p className="text-2xl font-bold text-teal-600">
                {connectedAccounts.reduce((sum, acc) => sum + acc.followers, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Across all platforms</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Avg. Engagement</h3>
              <p className="text-2xl font-bold text-green-600">
                {(connectedAccounts.reduce((sum, acc) => sum + acc.engagement, 0) / connectedAccounts.length).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Engagement rate</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Social Accounts</h2>
            </div>
            <button 
              onClick={() => setShowConnectModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
            >
              Connect New Platform
            </button>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Connected Accounts</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connectedAccounts.map((account) => (
                  <div key={account.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${getPlatformColor(account.platform)} rounded-xl flex items-center justify-center`}>
                          <span className="text-white text-2xl">{getPlatformIcon(account.platform)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{account.accountName}</h4>
                          <p className="text-sm text-gray-600">{account.handle}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                            {account.status}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDisconnect(account.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{account.followers.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{account.posts}</p>
                        <p className="text-xs text-gray-600">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{account.engagement}%</p>
                        <p className="text-xs text-gray-600">Engagement</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last sync: {account.lastSync}</span>
                      <button className="text-teal-600 hover:text-teal-800 font-medium">
                        Sync Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Available Platforms */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Available Platforms</h3>
              <p className="text-gray-600 mt-1">Connect additional social media platforms to expand your reach</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availablePlatforms.map((platform) => (
                  <div key={platform.platform} className="border border-gray-200 rounded-xl p-6 hover:border-teal-300 transition-colors">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center`}>
                        <span className="text-white text-2xl">{platform.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{platform.platform}</h4>
                        <p className="text-sm text-gray-600">{platform.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleConnectPlatform(platform.platform)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Connect {platform.platform}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Platform Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Connect {selectedPlatform || 'New Platform'}
                </h2>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {selectedPlatform ? (
                <div className="text-center">
                  <div className={`w-16 h-16 ${getPlatformColor(selectedPlatform)} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-white text-3xl">{getPlatformIcon(selectedPlatform)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect your {selectedPlatform} account</h3>
                  <p className="text-gray-600 mb-6">
                    You'll be redirected to {selectedPlatform} to authorize SparQ to manage your account.
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        alert(`Connecting to ${selectedPlatform}...`);
                        setShowConnectModal(false);
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Continue to {selectedPlatform}
                    </button>
                    <button
                      onClick={() => setShowConnectModal(false)}
                      className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a platform to connect</h3>
                  <div className="space-y-3">
                    {availablePlatforms.map((platform) => (
                      <button
                        key={platform.platform}
                        onClick={() => setSelectedPlatform(platform.platform)}
                        className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-teal-300 transition-colors"
                      >
                        <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                          <span className="text-white text-lg">{platform.icon}</span>
                        </div>
                        <span className="font-medium text-gray-900">{platform.platform}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
