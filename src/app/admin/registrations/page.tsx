"use client";
import React, { useEffect, useState } from 'react';

interface RegistrationItem {
  id: string; email: string; name?: string; company?: string; roleRequested: string; createdAt: string;
}

export default function AdminRegistrationsPage() {
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending'|'approved'|'denied'>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/auth/registrations?status=${status}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data.items);
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, [status]);

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    try {
      const res = await fetch('/api/auth/review', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ id, approve }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      load();
    } catch (e:any) { alert(e.message || 'Failed'); } finally { setBusyId(null); }
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Registration Requests</h1>
        <label className="text-xs text-slate-600 flex items-center gap-2">Status
          <select aria-label="Filter by status" value={status} onChange={e=>setStatus(e.target.value as any)} className="border rounded-md px-2 py-1 text-sm ml-2">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </label>
      </div>
      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !items.length && <p className="text-sm text-slate-500">No requests.</p>}
      <ul className="space-y-3">
        {items.map(r => (
          <li key={r.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-medium text-slate-800">{r.email} <span className="text-xs text-slate-400">({r.roleRequested})</span></p>
              <p className="text-xs text-slate-500">{r.company || '—'} • {new Date(r.createdAt).toLocaleString()}</p>
            </div>
            {status==='pending' && (
              <div className="flex gap-2">
                <button disabled={!!busyId} onClick={()=>decide(r.id,true)} className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{busyId===r.id? '...' : 'Approve'}</button>
                <button disabled={!!busyId} onClick={()=>decide(r.id,false)} className="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{busyId===r.id? '...' : 'Deny'}</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
