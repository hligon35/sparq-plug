"use client";
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const isDev = process.env.NODE_ENV === 'development' || 
                typeof window !== 'undefined' && 
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  useEffect(() => {
    if (!isDev) {
      const rt = encodeURIComponent(window.location.href);
      const target = `https://portal.getsparqd.com/login?sso=1&returnTo=${rt}`;
      window.location.replace(target);
    }
  }, [isDev]);

  if (!isDev) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Redirecting to Portal Login…</h1>
          <p className="text-gray-600 mb-4">Please sign in via the SparQ Portal.</p>
          <a
            href="https://portal.getsparqd.com/login?sso=1"
            className="inline-block px-4 py-2 bg-[#1d74d0] text-white rounded-lg"
          >
            Open Portal Login
          </a>
        </div>
      </main>
    );
  }

  // Development welcome page
  return (
    <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#1d74d0] mb-4">Welcome to SparQ Plug</h1>
            <p className="text-xl text-gray-600 mb-2">Social Media Management Platform</p>
            <div className="inline-block px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800">🚧 Development Mode Active</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/admin" className="bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-xl p-6 transition-colors group">
              <div className="text-red-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Admin Dashboard</h3>
              <p className="text-sm text-red-600">Manage platform, clients, and system settings</p>
            </Link>
            
            <Link href="/manager" className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl p-6 transition-colors group">
              <div className="text-blue-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Manager Dashboard</h3>
              <p className="text-sm text-blue-600">Oversee multiple clients and campaigns</p>
            </Link>
            
            <Link href="/client" className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl p-6 transition-colors group">
              <div className="text-green-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-700 mb-2">Client Dashboard</h3>
              <p className="text-sm text-green-600">Manage your social media presence</p>
            </Link>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <Link 
              href="/login" 
              className="inline-block bg-[#1d74d0] hover:bg-[#155ba0] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Login Page
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
