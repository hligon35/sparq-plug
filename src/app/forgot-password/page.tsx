"use client";
import React, { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Placeholder – would call real endpoint
    if (!email) { setError('Email required'); return; }
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md bg-white/70 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset password</h1>
        <p className="text-sm text-slate-600 mb-6">Enter your email and well send reset instructions if an account exists.</p>
        {submitted ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-4">
            If that email is registered, a reset link will arrive shortly.
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none" />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3" role="alert">{error}</div>}
            <div className="flex justify-center">
              <button type="submit" className="h-11 px-8 rounded-lg bg-[#1d74d0] text-white text-sm font-medium hover:bg-[#155ba0] transition">Send reset link</button>
            </div>
          </form>
        )}
        <p className="mt-8 text-center text-xs text-slate-500"><a href="/login" className="text-[#1d74d0] hover:text-[#155ba0]">Back to login</a></p>
      </div>
    </main>
  );
}