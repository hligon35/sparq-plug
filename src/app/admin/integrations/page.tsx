'use client';

import { useState } from 'react';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';
import PlatformHealth from '@/components/PlatformHealth';

export default function PlatformIntegrations() {
  const [platforms, setPlatforms] = useState([
    { id: 1, name: 'Facebook', status: 'Connected', accounts: 12, lastSync: '2 minutes ago', icon: '📘' },
    { id: 2, name: 'Instagram', status: 'Connected', accounts: 8, lastSync: '5 minutes ago', icon: '📷' },
    { id: 3, name: 'Twitter/X', status: 'Connected', accounts: 15, lastSync: '1 minute ago', icon: '🐦' },
    { id: 4, name: 'LinkedIn', status: 'Connected', accounts: 6, lastSync: '10 minutes ago', icon: '💼' },
    { id: 5, name: 'TikTok', status: 'Connected', accounts: 4, lastSync: '3 minutes ago', icon: '🎵' },
    { id: 6, name: 'YouTube', status: 'Disconnected', accounts: 0, lastSync: 'Never', icon: '📹' },
    { id: 7, name: 'Pinterest', status: 'Disconnected', accounts: 0, lastSync: 'Never', icon: '📌' }
  ]);

  const handleConnect = (platformName: string) => {
    alert(`Connect to ${platformName} would open authentication flow`);
  };

  const handleDisconnect = (platformName: string) => {
    alert(`Disconnect from ${platformName} confirmation would appear`);
  };

  const handleConfigure = (platformName: string) => {
    alert(`Configure ${platformName} settings would open`);
  };

  // Top nav links handle routing; sidebar removed

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Platform Integrations" subtitle="Connect and manage social media platforms" />

      {/* Centered content with top nav pills */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          {/* Main Content */}
          <div className="">
          {/* Connected Platforms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {platforms.map((platform) => (
              <div key={platform.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{platform.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{platform.name}</h3>
                      <p className="text-sm text-gray-500">{platform.accounts} accounts connected</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    platform.status === 'Connected' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {platform.status}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Last sync: {platform.lastSync}</p>
                </div>
                
                <div className="flex space-x-2">
                  {platform.status === 'Connected' ? (
                    <>
                      <button 
                        onClick={() => handleConfigure(platform.name)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Configure
                      </button>
                      <button 
                        onClick={() => handleDisconnect(platform.name)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleConnect(platform.name)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Integration Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-800">Integration Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Connected Platforms</span>
                  <span className="text-2xl font-bold text-green-600">{platforms.filter(p => p.status === 'Connected').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Accounts</span>
                  <span className="text-2xl font-bold text-blue-600">{platforms.reduce((sum, p) => sum + p.accounts, 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Connections</span>
                  <span className="text-2xl font-bold text-orange-600">{platforms.filter(p => p.status === 'Disconnected').length}</span>
                </div>
              </div>
            </div>
            {/* Live platform health widget */}
            <PlatformHealth />
          </div>

          {/* API Usage & Limits */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-800">API Usage & Limits</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2.1K</div>
                  <div className="text-sm text-gray-600">Daily API Calls</div>
                  <div className="text-xs text-gray-500 mt-1">of 10K limit</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-xs text-gray-500 mt-1">last 24 hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">245ms</div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                  <div className="text-xs text-gray-500 mt-1">time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
                  <div className="text-sm text-gray-600">Rate Limit</div>
                  <div className="text-xs text-gray-500 mt-1">warnings today</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
