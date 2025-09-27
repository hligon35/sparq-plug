'use client';

import { useState } from 'react';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerTopNav from '@/components/ManagerTopNav';
import InvitationManager from '@/components/InvitationManager';
import ManagerSectionBanner from '@/components/ManagerSectionBanner';

export default function ManagerSettingsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'clients' | 'analytics' | 'settings' | 'tasks'>('settings');
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Navigation handler
  const handleNav = (section: 'dashboard' | 'invoices' | 'clients' | 'analytics' | 'settings' | 'tasks') => {
    if (section === 'settings') return;
    const map: Record<string,string> = {
      dashboard: '/manager',
      invoices: '/manager?tab=invoices',
      clients: '/manager/clients',
      analytics: '/manager/analytics',
      tasks: '/manager/tasks',
      settings: '/manager/settings'
    };
    window.location.href = map[section];
  };
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    // TODO: Connect to real backend API
    alert('Password updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
    setShowSecurityModal(false);
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      // TODO: Connect to real 2FA setup
      alert('2FA setup initiated! In production, this would show QR code setup.');
      setTwoFactorEnabled(true);
    } else {
      alert('2FA disabled successfully!');
      setTwoFactorEnabled(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <ManagerHeader title="SparQ Plug" subtitle="Account & Security Management" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManagerTopNav active={activeTab} onChange={handleNav} />
        
        <div className="space-y-8">
          <ManagerSectionBanner
            icon="⚙️"
            title="Account Settings"
            subtitle="Manage your account security and preferences"
            variant="teal"
          />

          {/* Settings Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Security Settings */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-red-600 text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Security</h3>
                  <p className="text-gray-600 text-sm">Manage your account security settings</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Password</label>
                  <button 
                    onClick={() => setShowSecurityModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow"
                  >
                    Update Password
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Last changed 3 months ago</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication (2FA)</label>
                  <button 
                    onClick={handleToggle2FA}
                    className={`${twoFactorEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white px-4 py-2 rounded-lg font-medium shadow`}
                  >
                    {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    {twoFactorEnabled ? '2FA is currently enabled for your account.' : 'Add an extra layer of security to your account.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Preferences */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👤</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Account Preferences</h3>
                  <p className="text-gray-600 text-sm">Customize your account settings</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Notifications</label>
                  <div className="space-y-3">
                    {[
                      { id: 'client-updates', label: 'Client Updates', enabled: true },
                      { id: 'payment-alerts', label: 'Payment Alerts', enabled: true },
                      { id: 'system-notifications', label: 'System Notifications', enabled: false },
                      { id: 'marketing-emails', label: 'Marketing Emails', enabled: false }
                    ].map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            defaultChecked={setting.enabled}
                            aria-label={`Toggle ${setting.label}`}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Dashboard View</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" title="Default dashboard view">
                    <option value="overview">Overview</option>
                    <option value="clients">Client List</option>
                    <option value="analytics">Analytics</option>
                    <option value="invoices">Invoices</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-xl">🏢</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Business Information</h3>
                  <p className="text-gray-600 text-sm">Update your business details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                  <input 
                    type="text" 
                    defaultValue="SparQ Digital Marketing"
                    placeholder="Enter business name"
                    aria-label="Business Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input 
                    type="email" 
                    defaultValue="manager@sparqdigital.com"
                    placeholder="Enter contact email"
                    aria-label="Contact Email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    defaultValue="+1 (555) 123-4567"
                    placeholder="Enter phone number"
                    aria-label="Phone Number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input 
                    type="url" 
                    defaultValue="https://sparqdigital.com"
                    placeholder="Enter website URL"
                    aria-label="Website"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow transition-colors">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Client Invitation Management */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📧</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Client Invitations</h3>
                  <p className="text-gray-600 text-sm">Invite and manage your clients</p>
                </div>
              </div>

              <InvitationManager 
                currentUserEmail="manager@sparqdigital.com" 
                currentUserRole="manager" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Enter new password"
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
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
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
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSecurityModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}