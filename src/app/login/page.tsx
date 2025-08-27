"use client";
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TEST_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'client', password: 'client123', role: 'client' },
  { username: 'manager', password: 'manager123', role: 'manager' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const user = TEST_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      setError('');
      // Set role cookie so middleware authorizes protected routes
      // 1-day lifetime, works under basePath
      document.cookie = `role=${user.role}; Path=/; Max-Age=86400; SameSite=Lax`;
      document.cookie = `username=${encodeURIComponent(username)}; Path=/; Max-Age=86400; SameSite=Lax`;
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'manager') router.push('/manager');
      else router.push('/client');
    } else {
      setError('Invalid credentials');
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fb] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg flex flex-col items-center border border-gray-200">
        <Image src="/images/SparQLogo.png" alt="SparQ Logo" width={120} height={120} className="mb-6" />
        <h1 className="text-3xl font-bold mb-6 text-[#1d74d0] text-center w-full">Welcome to Sparq</h1>
        <form className="w-full space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block mb-2 font-semibold text-gray-800">Username</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 transition"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-800">Password</label>
            <div className="relative">
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400 transition pr-12"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
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
          {error && <div className="text-red-600 text-sm font-medium text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 bg-[#1d74d0] hover:bg-[#1667bd] text-white rounded-lg font-semibold text-lg shadow transition"
          >
            Login
          </button>
        </form>
        <div className="mt-8 text-sm text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-200 w-full">
          <div className="font-semibold mb-1 text-gray-900">Test credentials:</div>
          <div>Admin: <b className="text-gray-900">admin</b> / <b className="text-gray-900">admin123</b></div>
          <div>Manager: <b className="text-gray-900">manager</b> / <b className="text-gray-900">manager123</b></div>
          <div>Client: <b className="text-gray-900">client</b> / <b className="text-gray-900">client123</b></div>
        </div>
      </div>
    </main>
  );
}
