"use client";
import React, { useEffect, useState } from 'react';

interface AuditEvent { id: string; at: string; actor: string; tenantId: string; action: string; target?: string; metadata?: Record<string, unknown>; }

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');

  async function load() {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (action) params.set('action', action);
      if (actor) params.set('actor', actor);
      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setItems(data.items);
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); }, []); // initial

  function formatMeta(m?: Record<string, unknown>) {
    if (!m) return '';
    try { return JSON.stringify(m); } catch { return ''; }
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Audit Log</h1>
          <p className="text-xs text-slate-500">Latest security & system events (most recent first)</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col">
            <label className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">Action</label>
            <input value={action} onChange={e=>setAction(e.target.value)} placeholder="auth.login.success" className="border rounded-md px-2 py-1 text-sm" />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">Actor</label>
            <input value={actor} onChange={e=>setActor(e.target.value)} placeholder="user@example.com" className="border rounded-md px-2 py-1 text-sm" />
          </div>
          <button onClick={load} className="h-9 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Filter</button>
        </div>
      </div>
      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !items.length && <p className="text-sm text-slate-500">No events.</p>}
      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Time</th>
              <th className="text-left px-3 py-2 font-medium">Actor</th>
              <th className="text-left px-3 py-2 font-medium">Action</th>
              <th className="text-left px-3 py-2 font-medium">Target</th>
              <th className="text-left px-3 py-2 font-medium">Metadata</th>
            </tr>
          </thead>
          <tbody>
            {items.map(ev => (
              <tr key={ev.id} className="odd:bg-white even:bg-slate-50 border-b last:border-0">
                <td className="px-3 py-2 whitespace-nowrap font-medium text-slate-700">{new Date(ev.at).toLocaleString()}</td>
                <td className="px-3 py-2 text-slate-800">{ev.actor}</td>
                <td className="px-3 py-2"><span className="inline-block rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-700">{ev.action}</span></td>
                <td className="px-3 py-2 text-slate-600">{ev.target || '—'}</td>
                <td className="px-3 py-2 text-slate-500 max-w-sm truncate" title={formatMeta(ev.metadata)}>{formatMeta(ev.metadata)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
