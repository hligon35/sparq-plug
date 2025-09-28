"use client";

import InvoiceModule from '@/components/InvoiceModule';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ManagerLayout from '@/components/ManagerLayout';
import TaskList from '@/components/TaskList';
import TaskCreate from '@/components/TaskCreate';
import ManagerSectionBanner from '@/components/ManagerSectionBanner';
import { managerRouteMap, navigateManager, ManagerTabKey } from '@/lib/managerNav';
import { SecurityModal } from '@/components';

type TabKey = ManagerTabKey;

function ManagerInvoicePageInner() {


  // Security modal state
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  // Security modal logic moved to <SecurityModal />

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
    navigateManager(section, {
      internalHandler: (t) => setActiveTab(t)
    });
  }

  return (
    <ManagerLayout
      active={activeTab}
      headerSubtitle="Account & Business Management Portal"
      onNavChange={(tab) => navigateManager(tab, { internalHandler: (t)=> setActiveTab(t) })}
    >
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
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowSecurityModal(true)}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Account Security
          </button>
        </div>
      {/* Security Modal */}
      <SecurityModal open={showSecurityModal} onClose={() => setShowSecurityModal(false)} />
    </ManagerLayout>
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
