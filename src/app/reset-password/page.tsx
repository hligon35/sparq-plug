"use client";
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md bg-white/70 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h1>
        {!token && <p className="text-sm text-red-600">Missing token.</p>}
        {done ? (
          <div className="space-y-4">
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-4">Password updated successfully.</div>
            <p className="text-center"><a href="/login" className="text-[#1d74d0] hover:text-[#155ba0] text-sm font-medium">Return to login</a></p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">New password</label>
              <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="confirm">Confirm password</label>
              <input id="confirm" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={8} className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none" />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3" role="alert">{error}</div>}
            <div className="flex justify-center">
              <button disabled={loading || !token} className="h-11 px-8 rounded-lg bg-[#1d74d0] text-white text-sm font-medium hover:bg-[#155ba0] transition disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Updating…' : 'Update password'}</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
