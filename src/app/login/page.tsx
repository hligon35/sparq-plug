"use client";
import React, { useState } from 'react';
import { withBasePath } from '@/lib/basePath';
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
      const res = await fetch(withBasePath('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const role = data.role;
      router.push(role === 'admin' ? '/admin' : role === 'client' ? '/client' : '/manager');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  // Legacy external portal SSO removed; keeping placeholder for future external SSO integration.

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#1d74d0] flex items-center justify-center shadow-md shadow-blue-200/60">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to continue to SparQ Plug</p>
        </div>

        <div className="bg-white/70 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
                  <span>Email address</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none transition"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                  <a href="/app/forgot-password" className="text-xs font-medium text-[#1d74d0] hover:text-[#155ba0]">Forgot password?</a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none transition"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>
            )}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="relative inline-flex justify-center items-center rounded-lg bg-[#1d74d0] text-white text-sm font-medium shadow hover:bg-[#155ba0] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d74d0] disabled:opacity-60 disabled:cursor-not-allowed transition px-8 h-11"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-slate-600">
              Need an account? <a href="/app/request-access" className="font-medium text-[#1d74d0] hover:text-[#155ba0]">Request access</a>
            </p>
            <p className="text-xs text-slate-400">Issues signing in? Contact your administrator.</p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center space-y-3">
            {process.env.NODE_ENV === 'development' && (
              <p className="text-[10px] text-slate-400">
                <a href="/devLogin" className="underline hover:text-[#1d74d0]">Dev role switch</a>
              </p>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-400">Secured session • JWT cookie prototype</p>
      </div>
    </main>
  );
}
