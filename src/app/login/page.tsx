"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const router = useRouter();

  const isDev = process.env.NODE_ENV === 'development' || 
                typeof window !== 'undefined' && 
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const handleDevLogin = (role: string) => {
    // Set role cookie for development
    document.cookie = `role=${role}; path=/; max-age=86400`; // 24 hours
    
    // Redirect based on role
    switch (role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'manager':
        router.push('/manager');
        break;
      case 'client':
        router.push('/client');
        break;
      default:
        router.push('/');
    }
  };

  const handleProductionRedirect = () => {
    const rt = encodeURIComponent(window.location.href.replace('/login', ''));
    const target = `https://portal.getsparqd.com/login?sso=1&returnTo=${rt}`;
    window.location.replace(target);
  };

  if (!isDev) {
    // Production behavior - redirect to external portal
    handleProductionRedirect();
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fb] px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg text-center border border-gray-200">
          <h1 className="text-2xl font-semibold text-[#1d74d0] mb-4">Redirecting to Portal Login…</h1>
          <a href="https://portal.getsparqd.com/login?sso=1" className="inline-block px-4 py-2 bg-[#1d74d0] text-white rounded-lg">Open Portal Login</a>
        </div>
      </main>
    );
  }

  // Development login interface
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fb] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg text-center border border-gray-200">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1d74d0] mb-2">SparQ Plug</h1>
          <p className="text-gray-600">Development Login</p>
          <div className="mt-4 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">🚧 Development Mode - Choose your role</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => handleDevLogin('admin')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            <span>Login as Admin</span>
          </button>
          
          <button
            onClick={() => handleDevLogin('manager')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Login as Manager</span>
          </button>
          
          <button
            onClick={() => handleDevLogin('client')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>Login as Client</span>
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Production Login</p>
          <button
            onClick={handleProductionRedirect}
            className="text-[#1d74d0] hover:text-[#155ba0] font-medium text-sm"
          >
            Use Portal Login Instead →
          </button>
        </div>
      </div>
    </main>
  );
}
