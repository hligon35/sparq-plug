"use client";

import { useState } from 'react';
import ClientHeader from '@/components/ClientHeader';
import ClientTopNav from '@/components/ClientTopNav';

// Types for settings structures
type NotificationKey =
  | 'emailNotifications'
  | 'pushNotifications'
  | 'smsNotifications'
  | 'marketingEmails'
  | 'securityAlerts'
  | 'postReminders'
  | 'analyticsReports';

type PrivacyKey = 'dataSharing' | 'analyticsTracking' | 'thirdPartyIntegrations';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'integrations' | 'account'>('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corporation',
    timezone: 'America/New_York',
    language: 'English',
    twoFactorEnabled: false,
  });

  const [notificationSettings, setNotificationSettings] = useState<Record<NotificationKey, boolean>>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    securityAlerts: true,
    postReminders: true,
    analyticsReports: false,
  });

  const [privacySettings, setPrivacySettings] = useState<{
    profileVisibility: 'public' | 'team' | 'private';
    dataSharing: boolean;
    analyticsTracking: boolean;
    thirdPartyIntegrations: boolean;
  }>({
    profileVisibility: 'team',
    dataSharing: false,
    analyticsTracking: true,
    thirdPartyIntegrations: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [integrations, setIntegrations] = useState([
    { name: 'Facebook', status: 'connected' as const, icon: '📘', description: '2 pages connected' },
    { name: 'Instagram', status: 'connected' as const, icon: '📷', description: '1 business account connected' },
    { name: 'Twitter', status: 'disconnected' as const, icon: '🐦', description: 'Not connected' },
    { name: 'LinkedIn', status: 'connected' as const, icon: '💼', description: '1 company page connected' },
    { name: 'TikTok', status: 'disconnected' as const, icon: '🎵', description: 'Not connected' },
    { name: 'YouTube', status: 'disconnected' as const, icon: '📺', description: 'Not connected' },
  ]);

  // Tabs and options
  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'account', label: 'Account', icon: '⚙️' },
  ] as const;

  const notificationOptions: { key: NotificationKey; label: string; description: string }[] = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via text message' },
    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional and marketing content' },
    { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security and login notifications' },
    { key: 'postReminders', label: 'Post Reminders', description: 'Reminders for scheduled posts' },
    { key: 'analyticsReports', label: 'Analytics Reports', description: 'Weekly analytics and performance reports' },
  ];

  const privacyOptions: { key: PrivacyKey; label: string; description: string }[] = [
    { key: 'dataSharing', label: 'Data Sharing', description: 'Allow sharing of anonymized usage data for product improvement' },
    { key: 'analyticsTracking', label: 'Analytics Tracking', description: 'Enable tracking for analytics and performance monitoring' },
    { key: 'thirdPartyIntegrations', label: 'Third-Party Integrations', description: 'Allow connections to external services and platforms' },
  ];

  // Handlers
  const handleProfileUpdate = () => alert('Profile updated successfully!');
  const handleDataExport = () => alert('Data export initiated. You will receive an email with a download link.');
  const handleAccountDeactivation = () => {
    if (confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      alert('Account deactivation process initiated.');
    }
  };

  const handleNotificationUpdate = (key: NotificationKey, value: boolean) =>
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));

  const handlePrivacyUpdate = (key: PrivacyKey | 'profileVisibility', value: boolean | 'public' | 'team' | 'private') =>
    setPrivacySettings((prev) => ({ ...prev, [key]: value } as typeof prev));

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    alert('Password changed successfully!');
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
  <ClientHeader title="Settings" subtitle="Manage your account preferences and security" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ClientTopNav />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Settings Menu */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Settings Categories</h3>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profile */}
        {activeTab === 'profile' && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
                  </div>
                  <div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Change Photo</button>
                    <p className="text-gray-500 text-sm mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">First Name</label>
                    <input id="firstName" type="text" value={profileData.firstName} onChange={(e) => setProfileData((p) => ({ ...p, firstName: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">Last Name</label>
                    <input id="lastName" type="text" value={profileData.lastName} onChange={(e) => setProfileData((p) => ({ ...p, lastName: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                  <input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData((p) => ({ ...p, email: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone Number</label>
                    <input id="phone" type="tel" value={profileData.phone} onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-gray-700 font-medium mb-2">Company</label>
                    <input id="company" type="text" value={profileData.company} onChange={(e) => setProfileData((p) => ({ ...p, company: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="timezone" className="block text-gray-700 font-medium mb-2">Timezone</label>
                    <select id="timezone" value={profileData.timezone} onChange={(e) => setProfileData((p) => ({ ...p, timezone: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="language" className="block text-gray-700 font-medium mb-2">Language</label>
                    <select id="language" value={profileData.language} onChange={(e) => setProfileData((p) => ({ ...p, language: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button onClick={handleProfileUpdate} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">Save Changes</button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-6">
                {notificationOptions.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{setting.label}</h3>
                      <p className="text-gray-600 text-sm">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        aria-label={setting.label}
                        checked={notificationSettings[setting.key]}
                        onChange={(e) => handleNotificationUpdate(setting.key, (e.target as HTMLInputElement).checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Privacy */}
        {activeTab === 'privacy' && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="profileVisibility" className="block text-gray-700 font-medium mb-2">Profile Visibility</label>
                  <select
                    id="profileVisibility"
                    value={privacySettings.profileVisibility}
                    onChange={(e) => handlePrivacyUpdate('profileVisibility', e.target.value as 'public' | 'team' | 'private')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="team">Team Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                {privacyOptions.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{setting.label}</h3>
                      <p className="text-gray-600 text-sm">{setting.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        aria-label={setting.label}
                        checked={privacySettings[setting.key]}
                        onChange={(e) => handlePrivacyUpdate(setting.key, (e.target as HTMLInputElement).checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Integrations (static demo list) */}
        {activeTab === 'integrations' && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Connected Integrations</h2>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.name} className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{integration.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                        <p className="text-gray-600 text-sm">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        integration.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {integration.status === 'connected' ? 'Connected' : 'Not Connected'}
                      </span>
                      <button
                        onClick={() => {
                          // TODO: Connect to real social media integration APIs
                          const action = integration.status === 'connected' ? 'disconnected' : 'connected';
                          // Update the integration status in the local state
                          setIntegrations(prev => prev.map(int => 
                            int.name === integration.name 
                              ? { ...int, status: action }
                              : int
                          ));
                          const message = integration.status === 'connected' 
                            ? `${integration.name} disconnected successfully` 
                            : `${integration.name} connected successfully`;
                          alert(message);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          integration.status === 'connected'
                            ? 'bg-red-100 hover:bg-red-200 text-red-700'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Account */}
        {activeTab === 'account' && (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Settings</h2>
            <div className="space-y-6">
              {/* Security */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Change Password</h4>
                      <p className="text-gray-600 text-sm">Update your account password</p>
                    </div>
                    <button onClick={() => setShowPasswordModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Change Password</button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-gray-600 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <button
                      onClick={() => setShow2FAModal(true)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        profileData.twoFactorEnabled ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {profileData.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data & Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Export Data</h4>
                      <p className="text-gray-600 text-sm">Download a copy of your account data</p>
                    </div>
                    <button onClick={handleDataExport} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Export Data</button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-white">
                    <div>
                      <h4 className="font-medium text-red-900">Deactivate Account</h4>
                      <p className="text-red-700 text-sm">Permanently deactivate your account and delete all data</p>
                    </div>
                    <button onClick={handleAccountDeactivation} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Deactivate Account</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShowPasswordModal(false)} aria-label="Close password modal" title="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: (e.target as HTMLInputElement).value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    aria-label="Current password"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: (e.target as HTMLInputElement).value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    aria-label="New password"
                  />
                  <button type="button" onClick={() => setShowNewPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: (e.target as HTMLInputElement).value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    aria-label="Confirm new password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handlePasswordChange} className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">Change Password</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-lg relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setShow2FAModal(false)} aria-label="Close 2FA modal" title="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{profileData.twoFactorEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication</h2>
            <div className="space-y-4">
              {!profileData.twoFactorEnabled ? (
                <>
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-400">QR Code</span>
                    </div>
                    <p className="text-gray-600 text-sm">Scan this QR code with your authenticator app</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Verification Code</label>
                    <input type="text" placeholder="Enter 6-digit code" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Are you sure you want to disable two-factor authentication?</p>
                  <p className="text-red-600 text-sm">This will make your account less secure.</p>
                </div>
              )}
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShow2FAModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={() => setProfileData((p) => ({ ...p, twoFactorEnabled: !p.twoFactorEnabled }))} className={`flex-1 px-4 py-2 rounded-lg ${profileData.twoFactorEnabled ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                  {profileData.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
