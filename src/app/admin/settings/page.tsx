'use client';

import { useState } from 'react';
import InvoiceModule from '@/components/InvoiceModule';
import AdminTopNav from '@/components/AdminTopNav';
import AdminHeader from '@/components/AdminHeader';

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
    { id: 'team', name: 'Team Management', icon: '👥' }
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

          {/* Billing Section: Invoicing and Payments */}
          {activeSection === 'billing' && (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>💳</span> Invoicing & Payments
              </h3>
              <InvoiceModule />
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
