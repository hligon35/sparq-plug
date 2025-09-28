"use client";
import React, { useState } from 'react';

export default function RequestAccessPage() {
  const [form, setForm] = useState({ name: '', company: '', email: '', role: 'manager', password: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) { setForm(f => ({ ...f, [key]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.email || !form.password) { setError('Email & password required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password, name: form.name, company: form.company, role: form.role }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-lg bg-white/70 backdrop-blur rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Access</h1>
        <p className="text-sm text-slate-600 mb-6">Submit your details for an administrator to review.</p>
        {submitted ? (
          <div className="space-y-4">
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-4">Your request has been submitted. You will receive an email once it's reviewed.</div>
            <p className="text-center text-xs text-slate-500"><a href="/login" className="text-[#1d74d0] hover:text-[#155ba0]">Return to login</a></p>
          </div>
        ) : (
          <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">Full name</label>
                <input id="name" value={form.name} onChange={e=>update('name', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="company">Company</label>
                <input id="company" value={form.company} onChange={e=>update('company', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Work email</label>
              <input id="email" type="email" required value={form.email} onChange={e=>update('email', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none" />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="role">Requested role</label>
                <select id="role" value={form.role} onChange={e=>update('role', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none">
                  <option value="manager">Manager</option>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">Password</label>
                <input id="password" type="password" required value={form.password} onChange={e=>update('password', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white focus:border-[#1d74d0] focus:ring-[#1d74d0] px-4 py-2.5 text-sm outline-none" />
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3" role="alert">{error}</div>}
            <button type="submit" disabled={loading} className="h-11 rounded-lg bg-[#1d74d0] text-white text-sm font-medium hover:bg-[#155ba0] transition disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Submitting…' : 'Submit request'}</button>
            <p className="text-center text-xs text-slate-500">By submitting you agree to our <a href="/terms" className="text-[#1d74d0] hover:text-[#155ba0]">Terms</a>.</p>
          </form>
        )}
      </div>
    </main>
  );
}