"use client";

import InvoiceModule from '@/components/InvoiceModule';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerTopNav from '@/components/ManagerTopNav';
import TaskList from '@/components/TaskList';
import TaskCreate from '@/components/TaskCreate';
import ManagerSectionBanner from '@/components/ManagerSectionBanner';
import { managerRouteMap } from '@/lib/managerNav';

type TabKey = 'dashboard' | 'invoices' | 'clients' | 'analytics' | 'settings' | 'tasks';

function ManagerInvoicePageInner() {


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

  const searchParams = useSearchParams();
  const initialTabParam = searchParams?.get('tab');
  const initial: TabKey = (['dashboard','invoices','clients','analytics','settings','tasks'] as const).includes(initialTabParam as any) ? initialTabParam as TabKey : 'dashboard';
  const [activeTab, setActiveTab] = useState<TabKey>(initial);

  useEffect(()=>{
    // keep URL in sync without reloading for dashboard/invoices internal tabs
    const currentParam = searchParams?.get('tab');
    if ((activeTab === 'invoices' || activeTab === 'dashboard')) {
      const desired = activeTab === 'dashboard' ? null : 'invoices';
      if (desired !== currentParam) {
        const url = new URL(window.location.href);
        if (desired) url.searchParams.set('tab', desired); else url.searchParams.delete('tab');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [activeTab, searchParams]);

  // Navigation handler
  function navigateTab(section: TabKey) {
    if (section === 'dashboard' || section === 'invoices') {
      setActiveTab(section);
      return;
    }
    window.location.href = managerRouteMap[section];
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
  <ManagerHeader title="SparQ Plug" subtitle="Account & Business Management Portal" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <ManagerTopNav active={activeTab} onChange={navigateTab} />
        <div className="p-1">
      {activeTab === 'invoices' && (
            <>
              <ManagerSectionBanner
                icon="💳"
                title="Invoices & Payments"
                subtitle="Manage, track, and settle your business invoices securely"
                variant="teal"
              />
              <InvoiceModule />
            </>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <ManagerSectionBanner
                icon="📊"
                title="Manager Overview"
                subtitle="High-level performance, revenue and account status overview"
                variant="blue"
              />
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

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => navigateTab('invoices')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">💳</span>
                      <span className="text-sm font-medium text-gray-700">Create Invoice</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigateTab('clients')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">👥</span>
                      <span className="text-sm font-medium text-gray-700">Manage Clients</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigateTab('analytics')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">📊</span>
                      <span className="text-sm font-medium text-gray-700">View Reports</span>
                    </div>
                  </button>
                  <button
                    onClick={() => navigateTab('settings')}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">⚙️</span>
                      <span className="text-sm font-medium text-gray-700">Settings</span>
                    </div>
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h3>
                <TaskList scope="mine" />
                <div className="mt-6">
                  <TaskCreate />
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
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowSecurityModal(true)}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Account Security
          </button>
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

export default function ManagerInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading manager dashboard...</p>
          </div>
        </div>
      }
    >
      <ManagerInvoicePageInner />
    </Suspense>
  );
}
