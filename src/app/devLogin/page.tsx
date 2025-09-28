"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Development-only role selection page (previously /login).
 * Allows quick role cookie assignment for local testing.
 */
export default function DevLoginPage() {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => { setIsBrowser(true); }, []);
  const router = useRouter();

  const handleDevLogin = (role: string) => {
    document.cookie = `role=${role}; path=/; max-age=86400`; // 24h
    switch (role) {
      case 'admin': router.push('/admin'); break;
      case 'manager': router.push('/manager'); break;
      case 'client': router.push('/client'); break;
      default: router.push('/');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fb] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg text-center border border-gray-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1d74d0] mb-2">SparQ Plug</h1>
          <p className="text-gray-600">Development Role Switcher</p>
          <div className="mt-4 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">🚧 Dev Utility — not for production</p>
          </div>
        </div>
        <div className="space-y-4">
          <button onClick={() => handleDevLogin('admin')} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
            <span>Login as Admin</span>
          </button>
          <button onClick={() => handleDevLogin('manager')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
            <span>Login as Manager</span>
          </button>
          <button onClick={() => handleDevLogin('client')} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
            <span>Login as Client</span>
          </button>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
          Previously /login — keep bookmarked only for local testing.
        </div>
      </div>
    </main>
  );
}
