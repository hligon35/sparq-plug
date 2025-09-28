'use client';

import { useState } from 'react';
import InvoiceModule from '@/components/InvoiceModule';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';
import InvitationManager from '@/components/InvitationManager';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  
  const [settings, setSettings] = useState({
    companyName: 'SparQ Social',
    defaultTimezone: 'UTC-5',
    autoPublish: true,
    notifications: true,
    darkMode: false,
    apiRetries: 3
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  // Top nav handles routing; left sidebars removed

  const sections = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'api', name: 'API Settings', icon: '🔗' },
    { id: 'billing', name: 'Billing', icon: '💳' },
    { id: 'team', name: 'Team Management', icon: '👥' },
    { id: 'invitations', name: 'User Invitations', icon: '📧' }
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <AdminHeader title="Admin Settings" subtitle="Configure your social media platform" />

      {/* Centered content with top nav pills */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AdminTopNav />
          {/* Main Content */}
          <div className="">
            {/* Settings category pills (replaces right sidebar) */}
            <div className="flex flex-wrap gap-2 mb-6">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>{section.name}
                </button>
              ))}
            </div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">{sections.find(s => s.id === activeSection)?.icon}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                {sections.find(s => s.id === activeSection)?.name} Settings
              </h2>
            </div>
            <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-3 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Save Changes
            </button>
          </div>

          {/* Settings Content */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">General Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input 
                      id="companyName"
                      name="companyName"
                      type="text" 
                      value={settings.companyName}
                      onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                      placeholder="Enter company name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="defaultTimezone" className="block text-sm font-medium text-gray-700 mb-2">Default Timezone</label>
                    <select 
                      id="defaultTimezone"
                      name="defaultTimezone"
                      value={settings.defaultTimezone}
                      onChange={(e) => setSettings({...settings, defaultTimezone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="UTC-5">UTC-5 (Eastern)</option>
                      <option value="UTC-6">UTC-6 (Central)</option>
                      <option value="UTC-7">UTC-7 (Mountain)</option>
                      <option value="UTC-8">UTC-8 (Pacific)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Automation Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Auto-publish scheduled posts</h4>
                      <p className="text-sm text-gray-600">Automatically publish posts when scheduled time arrives</p>
                    </div>
                    <input 
                      type="checkbox" 
                      aria-label="Auto-publish scheduled posts"
                      checked={settings.autoPublish}
                      onChange={(e) => setSettings({...settings, autoPublish: e.target.checked})}
                      className="h-5 w-5 text-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Enable notifications</h4>
                      <p className="text-sm text-gray-600">Receive email and push notifications</p>
                    </div>
                    <input 
                      type="checkbox" 
                      aria-label="Enable notifications"
                      checked={settings.notifications}
                      onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                      className="h-5 w-5 text-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
                    Change Password
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
                    Enable Two-Factor Authentication
                  </button>
                  <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
                    View Login History
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'team' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Team Members</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">John Admin</h4>
                      <p className="text-sm text-gray-600">Administrator</p>
                    </div>
                    <button className="text-red-600 hover:text-red-700 font-medium">Remove</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h4 className="font-medium text-gray-800">Sarah Manager</h4>
                      <p className="text-sm text-gray-600">Content Manager</p>
                    </div>
                    <button className="text-red-600 hover:text-red-700 font-medium">Remove</button>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
                    Invite Team Member
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Settings Section */}
          {activeSection === 'api' && (
            <div className="space-y-6">
              {/* API Keys Management */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">API Keys</h3>
                  <p className="text-gray-600 mt-2">Manage your social media platform API keys and authentication</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: 'Facebook Graph API', key: 'fb_api_***********7d3f', status: 'Active', lastUsed: '2 hours ago' },
                      { name: 'Instagram Basic Display', key: 'ig_api_***********9a2b', status: 'Active', lastUsed: '15 minutes ago' },
                      { name: 'Twitter API v2', key: 'tw_api_***********4c8e', status: 'Active', lastUsed: '1 hour ago' },
                      { name: 'LinkedIn Marketing API', key: 'li_api_***********2f5g', status: 'Active', lastUsed: '3 hours ago' },
                      { name: 'TikTok for Business', key: 'tt_api_***********8h1j', status: 'Inactive', lastUsed: '2 days ago' }
                    ].map((api, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-800">{api.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              api.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {api.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Key: {api.key}</p>
                          <p className="text-xs text-gray-500 mt-1">Last used: {api.lastUsed}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-lg transition-colors">
                            Test
                          </button>
                          <button className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm rounded-lg transition-colors">
                            Regenerate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                    Add New API Integration
                  </button>
                </div>
              </div>

              {/* Rate Limits */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">Rate Limits & Usage</h3>
                  <p className="text-gray-600 mt-2">Monitor API usage and rate limit status across platforms</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { platform: 'facebook', used: 1847, limit: 5000, reset: '2 hours' },
                      { platform: 'instagram', used: 943, limit: 2000, reset: '45 minutes' },
                      { platform: 'twitter', used: 2156, limit: 3000, reset: '1 hour 15 minutes' },
                      { platform: 'linkedin', used: 234, limit: 1000, reset: '3 hours 20 minutes' }
                    ].map((data) => (
                      <div key={data.platform} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800 capitalize">{data.platform}</h4>
                          <span className="text-sm text-gray-600">{data.used}/{data.limit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (data.used / data.limit) > 0.8 ? 'bg-red-500 w-full' :
                              (data.used / data.limit) > 0.6 ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            data-width={`${(data.used / data.limit) * 100}%`}
                          />
                        </div>
                        <p className="text-xs text-gray-500">Resets in {data.reset}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              {/* Notification Settings */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">Notification Preferences</h3>
                  <p className="text-gray-600 mt-2">Configure how and when you receive notifications</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email', enabled: true },
                      { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications', enabled: true },
                      { key: 'slackIntegration', label: 'Slack Integration', description: 'Send alerts to Slack channel', enabled: false },
                      { key: 'smsAlerts', label: 'SMS Alerts', description: 'Critical alerts via SMS', enabled: false },
                      { key: 'desktopNotifications', label: 'Desktop Notifications', description: 'Desktop notification pop-ups', enabled: true },
                      { key: 'clientUpdates', label: 'Client Updates', description: 'Updates about client activities', enabled: true },
                      { key: 'systemAlerts', label: 'System Alerts', description: 'System status and maintenance alerts', enabled: true },
                      { key: 'apiWarnings', label: 'API Warnings', description: 'API rate limit and error warnings', enabled: true },
                      { key: 'scheduledPostReminders', label: 'Post Reminders', description: 'Upcoming scheduled post reminders', enabled: true },
                      { key: 'failureAlerts', label: 'Failure Alerts', description: 'Immediate alerts for post failures', enabled: true }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <h4 className="font-medium text-gray-800">{setting.label}</h4>
                          <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={setting.enabled}
                            aria-label={`Toggle ${setting.label}`}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">Recent Notifications</h3>
                  <p className="text-gray-600 mt-1">Latest system notifications and alerts</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {[
                    { type: 'success', title: 'Post Published Successfully', message: 'Your scheduled post for TechCorp has been published to Instagram and Facebook.', timestamp: '2 minutes ago', client: 'TechCorp' },
                    { type: 'warning', title: 'API Rate Limit Warning', message: 'Instagram API usage is at 85% of the daily limit. Consider spacing out posts.', timestamp: '15 minutes ago', client: null },
                    { type: 'error', title: 'Failed to Post', message: 'Unable to publish to Twitter for FashionBrand. Authentication token may be expired.', timestamp: '1 hour ago', client: 'FashionBrand' },
                    { type: 'info', title: 'New Client Onboarded', message: 'Peak Performance Fitness has been successfully added to the platform.', timestamp: '3 hours ago', client: 'Peak Performance Fitness' }
                  ].map((notification, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'success' ? 'border-green-200 bg-green-50' :
                          notification.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                          notification.type === 'error' ? 'border-red-200 bg-red-50' :
                          'border-blue-200 bg-blue-50'
                        }`}>
                          <span className="text-lg">
                            {notification.type === 'success' ? '✅' :
                             notification.type === 'warning' ? '⚠️' :
                             notification.type === 'error' ? '❌' : 'ℹ️'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-gray-600 mt-1 text-sm">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">{notification.timestamp}</span>
                            {notification.client && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {notification.client}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billing Section: Invoicing and Payments */}
          {activeSection === 'billing' && (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>💳</span> Invoicing & Payments
              </h3>
              <InvoiceModule />
            </div>
          )}

          {/* User Invitations Section */}
          {activeSection === 'invitations' && (
            <div className="space-y-6">
              <InvitationManager 
                currentUserEmail="admin@sparqdigital.com" 
                currentUserRole="admin" 
              />
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
