'use client';

import ClientTopNav from '@/components/ClientTopNav';
import Header from '@/components/Header';
import Link from 'next/link';

export default function ClientNotFound() {
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Header title="Client Portal" subtitle="Page not found" />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <ClientTopNav />
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Page not found</h1>
                <p className="text-gray-600 mb-6">We couldn’t find that client page. Head back to your dashboard.</p>
                <div className="flex gap-3">
                  <Link href="/client" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700">
                    Go to Client Dashboard
                  </Link>
                  <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
