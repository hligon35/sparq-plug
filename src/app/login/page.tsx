"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Real login page placeholder.
 * Currently performs a mock credential check and sets a signed-in role cookie (manager by default)
 * TODO: Replace with real authentication (NextAuth / custom API) and secure HttpOnly session cookie.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Mock check: accept any non-empty email/password
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      // Simplistic role inference just for demo: admin if email starts with admin@
      const role = email.startsWith('admin') ? 'admin' : email.startsWith('client') ? 'client' : 'manager';
      document.cookie = `role=${role}; path=/; max-age=86400`; // NOT secure – placeholder only
      router.push(role === 'admin' ? '/admin' : role === 'client' ? '/client' : '/manager');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function handlePortalRedirect() {
    const rt = encodeURIComponent(window.location.href.replace('/login', ''));
    const target = `https://portal.getsparqd.com/login?sso=1&returnTo=${rt}`;
    window.location.assign(target);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fb] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md border border-gray-200">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1d74d0] mb-2">SparQ Plug</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="text-left">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="text-left">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1d74d0] hover:bg-[#155ba0] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
          <button onClick={handlePortalRedirect} className="text-sm text-[#1d74d0] hover:text-[#155ba0] font-medium">Use Portal SSO Instead →</button>
          <p className="text-xs text-gray-500">Need different environment? <a href="/devLogin" className="underline hover:text-[#1d74d0]">Dev Role Switch</a></p>
        </div>
        <p className="mt-6 text-center text-[11px] text-gray-400">Prototype auth — replace with real secure implementation.</p>
      </div>
    </main>
  );
}
