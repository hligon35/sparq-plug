"use client";
import React, { useEffect, useState } from 'react';
import { timeAgo } from '@/lib/time';
console.log('[AUDIT_LOGS_PAGE_VERSION] 2025-09-28T22:30Z v2');

interface AuditRow { id: string; at: string; actor: string; action: string; target?: string | null; metadata?: any; }
interface AuditSummary { events24h: number; loginSuccess24h: number; loginFail24h: number; distinctActors24h: number; generatedAt: string; }

export default function AuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ action: '', actor: '' });
  useEffect(() => { load(true); fetchSummary(); }, []);
  async function fetchSummary() { try { const res = await fetch('/api/admin/audit/summary', { cache: 'no-store' }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed summary'); setSummary(data.stats); } catch {} }
  async function load(reset = false) { try { setLoading(true); setError(null); const params = new URLSearchParams(); if (filters.action.trim()) params.set('action', filters.action.trim()); if (filters.actor.trim()) params.set('actor', filters.actor.trim()); if (!reset && nextCursor) params.set('cursor', nextCursor); const res = await fetch(`/api/admin/audit/events?${params.toString()}`, { cache: 'no-store' }); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Request failed'); setNextCursor(data.nextCursor); setRows(r => reset ? data.events : [...r, ...data.events]); } catch (e: any) { setError(e.message || 'Failed'); } finally { setLoading(false); } }
  function submitFilters(e: React.FormEvent) { e.preventDefault(); setNextCursor(null); load(true); }
  return (
    <main className="space-y-8" aria-label="Audit logs content">
      <p className="text-sm text-slate-600">Immutable security & system event history. Filter by actor or action. Most recent first.</p>
      {summary && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Events (24h)" value={summary.events24h} />
          <KpiCard label="Login Success (24h)" value={summary.loginSuccess24h} />
          <KpiCard label="Login Fail (24h)" value={summary.loginFail24h} />
          <KpiCard label="Actors (24h)" value={summary.distinctActors24h} />
        </div>
      )}
      <form onSubmit={submitFilters} className="flex flex-wrap gap-4 items-end bg-white/80 backdrop-blur border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col"><label className="text-xs font-medium text-slate-600 mb-1" htmlFor="actor">Actor</label><input id="actor" value={filters.actor} onChange={e=> setFilters(f=>({...f, actor: e.target.value}))} placeholder="email@/username" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div className="flex flex-col"><label className="text-xs font-medium text-slate-600 mb-1" htmlFor="action">Action</label><input id="action" value={filters.action} onChange={e=> setFilters(f=>({...f, action: e.target.value}))} placeholder="auth.login.success" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
        <div className="flex gap-3"><button type="submit" disabled={loading} className="h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 disabled:opacity-60">Apply</button><button type="button" disabled={loading} onClick={()=> { setFilters({ action:'', actor:''}); setNextCursor(null); load(true); }} className="h-10 px-4 rounded-lg border border-slate-300 bg-white text-sm font-medium hover:bg-slate-50">Reset</button></div>
      </form>
      <section className="bg-white/80 backdrop-blur border border-slate-200 rounded-xl overflow-hidden shadow-sm" aria-label="Audit events table">
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-700"><tr className="text-left"><th className="px-3 py-2 font-medium text-xs uppercase tracking-wide">Time</th><th className="px-3 py-2 font-medium text-xs uppercase tracking-wide">Actor</th><th className="px-3 py-2 font-medium text-xs uppercase tracking-wide">Action</th><th className="px-3 py-2 font-medium text-xs uppercase tracking-wide">Target</th><th className="px-3 py-2 font-medium text-xs uppercase tracking-wide">Meta</th></tr></thead><tbody>{rows.map(r => (<tr key={r.id} className="odd:bg-white even:bg-slate-50/50 border-t border-slate-100 align-top"><td className="px-3 py-2 whitespace-nowrap text-xs text-slate-600" title={new Date(r.at).toLocaleString()}>{timeAgo(r.at)}</td><td className="px-3 py-2 font-mono text-[11px] text-slate-700 break-all max-w-[160px]">{r.actor}</td><td className="px-3 py-2 text-xs font-medium text-slate-800">{r.action}</td><td className="px-3 py-2 text-xs text-slate-600 break-all max-w-[160px]">{r.target || '-'}</td><td className="px-3 py-2 text-xs text-slate-600 max-w-[260px]">{r.metadata ? (<code className="text-[10px] break-all leading-tight">{truncate(JSON.stringify(r.metadata), 220)}</code>) : <span className="text-slate-400">—</span>}</td></tr>))}{!loading && rows.length === 0 && (<tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500 text-sm">No events found.</td></tr>)}</tbody></table></div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50"><div className="text-xs text-slate-500">{rows.length} loaded{nextCursor && ' • more available'}</div><div className="flex gap-3"><button onClick={()=> load(false)} disabled={loading || !nextCursor} className="h-8 px-3 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">Load More</button><button onClick={()=> { setNextCursor(null); load(true); }} disabled={loading} className="h-8 px-3 rounded-md border border-slate-300 bg-white text-xs font-medium hover:bg-slate-50 disabled:opacity-50">Refresh</button></div></div>
        {error && <div className="px-4 py-3 text-sm text-red-600 bg-red-50 border-t border-red-200">{error}</div>}
        {loading && <div className="px-4 py-3 text-xs text-slate-500 border-t border-slate-200 bg-white">Loading…</div>}
      </section>
      <aside className="text-xs text-slate-500 pt-4 border-t border-slate-200"><p>Retention currently unbounded (SQLite). Consider pruning or exporting when migrating to PostgreSQL.</p></aside>
    </main>
  );
}
function truncate(str: string, max: number) { return str.length > max ? str.slice(0, max - 1) + '…' : str; }
function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col">
      <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</span>
      <span className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">{value}</span>
    </div>
  );
}