'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stats, setStats] = useState({
    activeClients: 24,
    socialAccounts: 156,
    postsScheduled: 847,
    engagementRate: '12.8%'
  });
  const [systemStatus, setSystemStatus] = useState([
    { name: 'Facebook API', status: 'Connected', color: 'green' },
    { name: 'Instagram API', status: 'Connected', color: 'green' },
    { name: 'Twitter/X API', status: 'Connected', color: 'green' },
    { name: 'LinkedIn API', status: 'Connected', color: 'green' },
    { name: 'TikTok API', status: 'Connected', color: 'green' }
  ]);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, message: 'New client "TechCorp" onboarded', time: '2 minutes ago', color: 'blue' },
    { id: 2, message: '50 posts scheduled for this week', time: '15 minutes ago', color: 'green' },
    { id: 3, message: 'Analytics report generated for FashionBrand', time: '1 hour ago', color: 'purple' },
    { id: 4, message: 'Instagram integration updated', time: '3 hours ago', color: 'orange' }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeClients: prev.activeClients + Math.floor(Math.random() * 2 - 1),
        socialAccounts: prev.socialAccounts + Math.floor(Math.random() * 3 - 1),
        postsScheduled: prev.postsScheduled + Math.floor(Math.random() * 5 - 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    // Navigate to the specific page
    window.location.href = `/admin/${tab}`;
  };

  const handleQuickAction = (action: string) => {
    alert(`${action} clicked! This would navigate to the respective page.`);
  };

  // Security handlers
  const handlePasswordUpdate = () => {
    if (!newPassword || !confirmPassword) {
      alert('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    alert('Admin password updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
    setShowSecurityModal(false);
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      alert('Admin 2FA setup initiated! In production, this would show QR code setup.');
      setTwoFactorEnabled(true);
    } else {
      alert('Admin 2FA disabled successfully!');
      setTwoFactorEnabled(false);
    }
  };

  const handleSecurityAudit = () => {
    alert('Running security audit... In production, this would scan for vulnerabilities.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">📱</span>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">SparQ Social Media Admin Dashboard</h1>
              <p className="text-white/80 text-sm mt-1">Multi-Platform Social Media Management & Analytics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSecurityModal(true)}
              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Security
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 min-h-screen p-6">
          <nav className="space-y-3">
            <div className="bg-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <span className="font-medium">Dashboard</span>
              </div>
            </div>

            <button 
              onClick={() => handleNavClick('clients')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-cyan-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <span className="font-medium">Client Management</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavClick('scheduling')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Post Scheduling</span>
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

            <button 
              onClick={() => handleNavClick('integrations')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-teal-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium">Platform Integrations</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavClick('media')}
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
              onClick={() => handleNavClick('settings')}
              className="w-full bg-white hover:bg-blue-50 rounded-xl p-4 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-400 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </div>
                <span className="font-medium">Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* System Overview Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Social Media Overview</h2>
            </div>

            {/* Stats Grid - Social Media Focused */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                   onClick={() => handleQuickAction('View Active Clients')}>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-3">{stats.activeClients}</div>
                  <div className="text-white/90 text-lg font-medium">Active Clients</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                   onClick={() => handleQuickAction('Manage Social Accounts')}>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-3">{stats.socialAccounts}</div>
                  <div className="text-white/90 text-lg font-medium">Social Accounts</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                   onClick={() => handleQuickAction('View Scheduled Posts')}>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-3">{stats.postsScheduled}</div>
                  <div className="text-white/90 text-lg font-medium">Posts Scheduled</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                   onClick={() => handleQuickAction('View Engagement Report')}>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-3">{stats.engagementRate}</div>
                  <div className="text-white/90 text-lg font-medium">Engagement Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Status Section */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-800">Platform Integrations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStatus.map((platform, index) => (
                <div key={index} className="flex items-center space-x-4 text-gray-700 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className={`w-3 h-3 bg-${platform.color}-500 rounded-full`}></div>
                  <span className="text-lg font-medium">{platform.name}</span>
                  <span className="text-sm text-gray-500 ml-auto">{platform.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="text-2xl font-bold text-gray-800">Recent Activity</h3>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 text-gray-700 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200 border border-gray-100">
                  <div className={`w-3 h-3 bg-${activity.color}-500 rounded-full`}></div>
                  <div className="flex-1">
                    <p className="text-lg">{activity.message}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowSecurityModal(false)}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Security Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Change Admin Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" 
                    placeholder="New password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="relative mt-2">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" 
                    placeholder="Confirm new password" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button 
                  onClick={handlePasswordUpdate}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow"
                >
                  Update Password
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Two-Factor Authentication (2FA)</label>
                <button 
                  onClick={handleToggle2FA}
                  className={`${twoFactorEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white px-4 py-2 rounded-lg font-medium shadow`}
                >
                  {twoFactorEnabled ? 'Disable Admin 2FA' : 'Enable Admin 2FA'}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  {twoFactorEnabled ? 'Admin 2FA is currently enabled.' : 'Secure admin access with an extra layer of protection.'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">System Security Audit</label>
                <button 
                  onClick={handleSecurityAudit}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium shadow"
                >
                  Run Security Audit
                </button>
                <p className="text-xs text-gray-500 mt-1">Check for vulnerabilities and security issues.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}