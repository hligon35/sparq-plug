"use client";

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

type Mailbox = {
  id: string;
  address: string;
  label?: string;
  unread: number;
  provider: 'google' | 'microsoft' | 'zoho' | 'local' | 'unknown';
};

type Thread = {
  id: string;
  mailboxId: string;
  subject: string;
  from: string;
  snippet: string;
  unread: boolean;
  updatedAt: string; // ISO
};

export function ClientEmailView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeMailbox, setActiveMailbox] = useState<string>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/email/mailboxes');
        if (!res.ok) throw new Error(`Failed (${res.status})`);
        const data = await res.json();
        if (cancelled) return;
        setMailboxes(data.mailboxes || []);
        setThreads(data.threads || []);
      } catch (e) {
        if (!cancelled) setError((e as Error).message || 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = threads;
    if (activeMailbox !== 'all') list = list.filter(t => t.mailboxId === activeMailbox);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(t => t.subject.toLowerCase().includes(q) || t.snippet.toLowerCase().includes(q) || t.from.toLowerCase().includes(q));
    }
    return list.sort((a,b)=> b.updatedAt.localeCompare(a.updatedAt));
  }, [threads, activeMailbox, query]);

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-0px)] flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Email</h2>
          <p className="text-xs text-gray-500">Unified view of all your mailboxes (preview)</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/client" className="text-blue-600 underline text-xs">Back to Client Dashboard</Link>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
        <aside className="w-full md:w-52 shrink-0 space-y-4">
          <div className="bg-white border rounded-lg shadow-sm divide-y">
            <div className="p-3 flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                placeholder="Search"
                className="w-full rounded border px-2 py-1 text-sm"
                aria-label="Search threads"
              />
            </div>
            <nav className="py-2 text-sm" aria-label="Mailboxes">
              <button
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-blue-50 ${activeMailbox==='all' ? 'bg-blue-100 font-medium' : ''}`}
                onClick={()=>setActiveMailbox('all')}
              >
                <span>All Mailboxes</span>
                <span className="text-[11px] rounded bg-gray-200 px-1">{threads.filter(t=>t.unread).length}</span>
              </button>
              {mailboxes.map(m => (
                <button
                  key={m.id}
                  aria-label={`Mailbox ${m.address}`}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-blue-50 ${activeMailbox===m.id ? 'bg-blue-100 font-medium' : ''}`}
                  onClick={()=>setActiveMailbox(m.id)}
                >
                  <span className="truncate" title={m.address}>{m.label || m.address}</span>
                  <span className={`text-[11px] rounded px-1 ${m.unread ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}>{m.unread}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="text-[10px] text-gray-500 leading-snug px-1">
            Future: OAuth connect, labels, folder sync, real-time updates.
          </div>
        </aside>
        <section className="flex-1 flex flex-col min-h-0">
          <div className="bg-white border rounded-lg shadow-sm flex flex-col min-h-0 flex-1">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <h3 className="font-medium text-sm">Threads {activeMailbox !== 'all' && <span className="text-gray-400">(filtered)</span>}</h3>
              {loading && <span className="text-[11px] text-gray-400 animate-pulse">Loading…</span>}
              {error && <span className="text-[11px] text-red-600">{error}</span>}
            </div>
            <ul className="flex-1 overflow-auto divide-y text-sm" aria-label="Threads">
              {!loading && filtered.length === 0 && (
                <li className="p-6 text-center text-xs text-gray-500">No threads found (stub data)</li>
              )}
              {filtered.map(t => (
                <li key={t.id} className={`px-4 py-3 hover:bg-blue-50 cursor-pointer ${t.unread ? 'bg-blue-50/70' : ''}`}> 
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-[13px]">{t.subject || '(No subject)'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{t.from}</p>
                    </div>
                    <time className="text-[10px] text-gray-400" dateTime={t.updatedAt}>{new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-600 line-clamp-2">{t.snippet}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 text-[10px] text-gray-500">Preview module – data is mock and not persisted.</div>
        </section>
      </div>
    </div>
  );
}
