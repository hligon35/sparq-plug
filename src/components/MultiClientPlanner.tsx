"use client";
import { useEffect, useMemo, useState } from 'react';
import { withBasePath } from '@/lib/basePath';
import type { ScheduledPost } from '@/app/api/scheduled-posts/route';

type PlannerMode = 'all' | 'client';

interface AggregatedDay {
  date: string; // YYYY-MM-DD
  total: number;
  clients: Record<string, { clientId: string; clientName: string; count: number; statuses: Record<string, number>; posts: ScheduledPost[] }>;
}

interface Props {
  managerScope?: boolean; // if true restrict to manager's clients via managerId=current
}

export default function MultiClientPlanner({ managerScope }: Props) {
  const [mode, setMode] = useState<PlannerMode>('all');
  const [clientId, setClientId] = useState<string>('');
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const monthStartISO = useMemo(() => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    return d.toISOString().slice(0,10);
  }, [currentMonth]);
  const monthEndISO = useMemo(() => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 0, 23,59,59,999);
    return d.toISOString().slice(0,10);
  }, [currentMonth]);

  // Fetch clients list (reuse /api/clients)
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const url = managerScope ? '/api/clients?managerId=current' : '/api/clients';
        const res = await fetch(withBasePath(url));
        if (res.ok) {
          const data = await res.json();
            setClients((data.clients || []).map((c: any) => ({ id: c.id, name: c.name })));
        }
      } catch {}
    };
    fetchClients();
  }, [managerScope]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (mode === 'client' && clientId) params.set('clientId', clientId);
      if (managerScope) params.set('managerId', 'current');
      if (statusFilter) params.set('status', statusFilter);
      if (platformFilter) params.set('platform', platformFilter);
      params.set('from', monthStartISO);
      params.set('to', monthEndISO);
      params.set('aggregate', '0');
      const res = await fetch(withBasePath(`/api/scheduled-posts?${params.toString()}`));
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error('Failed loading posts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); /* eslint-disable-next-line */ }, [mode, clientId, statusFilter, platformFilter, monthStartISO, monthEndISO]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, ScheduledPost[]> = {};
    for (const p of posts) {
      const key = p.scheduledAt.slice(0,10);
      (map[key] ||= []).push(p);
    }
    return map;
  }, [posts]);

  const daysGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekDay = firstDay.getDay();
    const lastDay = new Date(year, month+1, 0).getDate();
    const cells: Date[] = [];
    // previous month padding
    for (let i=0;i<startWeekDay;i++) cells.push(new Date(year, month, i - startWeekDay + 1));
    for (let d=1; d<=lastDay; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length-1];
      cells.push(new Date(last.getFullYear(), last.getMonth(), last.getDate()+1));
    }
    return cells;
  }, [currentMonth]);

  const clientColor = (clientId: string) => {
    // deterministic pastel color from hash
    let hash = 0; for (let i=0;i<clientId.length;i++) hash = clientId.charCodeAt(i) + ((hash<<5)-hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h} 70% 85%)`;
  };
  const clientTextColor = (clientId: string) => {
    let hash = 0; for (let i=0;i<clientId.length;i++) hash = clientId.charCodeAt(i) + ((hash<<5)-hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h} 55% 30%)`;
  };

  const statusesSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach(p => { counts[p.status] = (counts[p.status]||0)+1; });
    return counts;
  }, [posts]);

  const navigateMonth = (dir: 'prev'|'next'|'today') => {
    if (dir==='today') return setCurrentMonth(new Date());
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + (dir==='next'? 1 : -1));
    setCurrentMonth(d);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
          <button onClick={()=>navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded" aria-label="Previous month">◀</button>
          <div className="font-semibold text-gray-800">{currentMonth.toLocaleString(undefined,{month:'long', year:'numeric'})}</div>
          <button onClick={()=>navigateMonth('next')} className="p-2 hover:bg-gray-100 rounded" aria-label="Next month">▶</button>
          <button onClick={()=>navigateMonth('today')} className="ml-2 text-sm px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700">Today</button>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
          <button onClick={()=>setMode('all')} className={`px-3 py-1 rounded text-sm font-medium ${mode==='all'?'bg-purple-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All Clients</button>
          <button onClick={()=>setMode('client')} className={`px-3 py-1 rounded text-sm font-medium ${mode==='client'?'bg-purple-600 text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Single Client</button>
          {mode==='client' && (
            <select aria-label="Select client" title="Select client" value={clientId} onChange={e=>setClientId(e.target.value)} className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm">
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
          <select aria-label="Filter by status" title="Filter by status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Failed">Failed</option>
          </select>
          <select aria-label="Filter by platform" title="Filter by platform" value={platformFilter} onChange={e=>setPlatformFilter(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option value="">All Platforms</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="Twitter/X">Twitter/X</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
          </select>
        </div>
        <div className="text-sm text-gray-600 flex gap-3">
          {Object.entries(statusesSummary).map(([s,c]) => (
            <span key={s} className="px-2 py-1 bg-gray-100 rounded">{s}: {c}</span>
          ))}
          {loading && <span className="text-purple-600">Loading…</span>}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysGrid.map((date, idx) => {
            const key = date.toISOString().slice(0,10);
            const dayPosts = eventsByDate[key] || [];
            const inMonth = date.getMonth() === currentMonth.getMonth();
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <div key={idx} className={`min-h-[120px] p-1 border border-gray-200 rounded-lg flex flex-col ${inMonth? 'bg-white':'bg-gray-50'} ${isToday? 'ring-2 ring-purple-500':''}`}>\n                <div className={`text-[11px] font-medium mb-1 ${inMonth? 'text-gray-800':'text-gray-400'} ${isToday? 'text-purple-600':''}`}>{date.getDate()}</div>
                <div className="space-y-1 flex-1">
                  {dayPosts.slice(0,3).map(p => (
                    <div key={p.id} className="rounded px-1 py-0.5 text-[10px] cursor-pointer group" style={{ background: clientColor(p.clientId), color: clientTextColor(p.clientId) }} title={`${p.clientName}: ${p.content}`}>\n                      <div className="flex items-center gap-1 truncate">
                        <span className="font-semibold truncate max-w-[70%]">{p.clientName.split(' ')[0]}</span>
                        <span className="opacity-70">{p.status[0]}</span>
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {p.platforms.slice(0,3).map(pl => <span key={pl} className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500" title={pl}></span>)}
                      </div>
                    </div>
                  ))}
                  {dayPosts.length > 3 && <div className="text-[10px] text-gray-500 text-center">+{dayPosts.length-3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Upcoming Posts</h3>
          <span className="text-xs text-gray-500">{posts.length} items</span>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {posts.filter(p => new Date(p.scheduledAt) >= new Date()).slice(0,50).map(p => (
            <div key={p.id} className="px-4 py-3 hover:bg-gray-50 text-sm flex items-start gap-4">
              <div className="mt-1 w-2 h-2 rounded-full" style={{ background: clientColor(p.clientId) }} aria-label={`Client color ${p.clientName}`} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{p.clientName}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{p.status}</span>
                  {p.platforms.map(pl => <span key={pl} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">{pl}</span>)}
                </div>
                <p className="text-gray-700 line-clamp-2 mb-1">{p.content}</p>
                <p className="text-xs text-gray-500">{new Date(p.scheduledAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {posts.length === 0 && !loading && <div className="p-6 text-center text-gray-500 text-sm">No posts found for filters</div>}
        </div>
      </div>
    </div>
  );
}
