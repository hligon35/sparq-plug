
'use client';


import InvoiceModule from '@/components/InvoiceModule';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function ManagerInvoicePage() {
  const router = useRouter();

  // Placeholder signOut function
  const signOut = useCallback(() => {
    // TODO: Replace with real sign out logic
    router.push('/login');
  }, [router]);


  // Security modal state
  const [showSecurityModal, setShowSecurityModal] = useState(false);
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

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Navigation handler
  const handleNav = (section: string) => {
    setActiveTab(section);
    if (section === 'dashboard') return; // Stay on dashboard
    if (section === 'invoices') return; // Show invoices section
    if (section === 'security') {
      setShowSecurityModal(true);
      return;
    }
    // For now, show coming soon alert for other sections
    // In production, these would navigate to actual pages
    // alert('Section coming soon: ' + section);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl">🏢</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Manager Dashboard</h1>
              <p className="text-white/80 text-sm mt-1">Account & Business Management Portal</p>
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
              onClick={signOut}
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
            <button 
              onClick={() => handleNav('dashboard')}
              className={`w-full rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  activeTab === 'dashboard' ? 'bg-white/20' : 'bg-blue-400'
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <span className="font-medium">Dashboard</span>
              </div>
            </button>

            <button 
              onClick={() => handleNav('invoices')}
              className={`w-full rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow ${
                activeTab === 'invoices' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  activeTab === 'invoices' ? 'bg-white/20' : 'bg-green-400'
                }`}>
                  <span className={`text-sm ${activeTab === 'invoices' ? 'text-white' : 'text-white'}`}>💳</span>
                </div>
                <span className="font-medium">Invoices & Payments</span>
              </div>
            </button>

            <button 
              onClick={() => handleNav('clients')}
              className={`w-full rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow ${
                activeTab === 'clients' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  activeTab === 'clients' ? 'bg-white/20' : 'bg-cyan-400'
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === 'clients' ? 'text-white' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <span className="font-medium">Client Management</span>
              </div>
            </button>

            <button 
              onClick={() => handleNav('analytics')}
              className={`w-full rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow ${
                activeTab === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  activeTab === 'analytics' ? 'bg-white/20' : 'bg-pink-400'
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-white' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <span className="font-medium">Analytics & Reports</span>
              </div>
            </button>

            <button 
              onClick={() => handleNav('settings')}
              className={`w-full rounded-xl p-4 border transition-all duration-200 shadow-sm hover:shadow ${
                activeTab === 'settings' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  activeTab === 'settings' ? 'bg-white/20' : 'bg-gray-400'
                }`}>
                  <svg className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </div>
                <span className="font-medium">Settings</span>
              </div>
            </button>
          </nav>

          {/* Manager Credentials */}
          <div className="mt-8 bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Manager Credentials</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  JM
                </div>
                <div>
                  <p className="font-medium text-gray-900">John Manager</p>
                  <p className="text-gray-600 text-sm">Business Manager</p>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">ID:</span> MGR-2024-001</p>
                <p><span className="font-medium">Level:</span> Premium Access</p>
                <p><span className="font-medium">Since:</span> Jan 2024</p>
              </div>
              <div className="flex space-x-2 pt-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Verified
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Pro Plan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'invoices' && (
            <>
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white p-6 rounded-2xl shadow-lg mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-2xl">💳</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Invoices & Payments</h1>
                    <p className="text-white/80 text-sm mt-1">Manage and pay your business invoices securely</p>
                  </div>
                </div>
              </div>
              <InvoiceModule />
            </>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manager Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Clients</p>
                      <p className="text-2xl font-bold text-gray-900">24</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-blue-600 text-xl">👥</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">$12,450</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-xl">💰</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pending Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <span className="text-orange-600 text-xl">📋</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleNav('invoices')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">💳</span>
                      <span className="text-sm font-medium text-gray-700">Create Invoice</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNav('clients')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">👥</span>
                      <span className="text-sm font-medium text-gray-700">Manage Clients</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNav('analytics')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">📊</span>
                      <span className="text-sm font-medium text-gray-700">View Reports</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNav('settings')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">⚙️</span>
                      <span className="text-sm font-medium text-gray-700">Settings</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'invoices' && activeTab !== 'dashboard' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🚧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon</h3>
              <p className="text-gray-500">This section is under development and will be available soon.</p>
            </div>
          )}
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Security Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Change Password</label>
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
        </div>
      )}
    </div>
  );
}
