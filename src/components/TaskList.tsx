'use client';
import { useEffect, useRef, useState } from 'react';

interface Task { id: string; title: string; description?: string; status: string; assignee: string; createdBy: string; createdAt: string; updatedAt: string; }

interface Props { scope?: 'mine' | 'all'; statuses?: string[]; q?: string; refreshIntervalMs?: number }

export default function TaskList({ scope = 'mine', statuses, q, refreshIntervalMs = 15000 }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, { id: string; body: string; author: string; createdAt: string }[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [commentBusy, setCommentBusy] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<'createdAt'|'updatedAt'|'status'>('createdAt');
  const [order, setOrder] = useState<'asc'|'desc'>('desc');

  function buildQuery() {
    const params = new URLSearchParams();
    params.set('scope', scope);
    if (q) params.set('q', q);
    if (statuses && statuses.length) params.set('status', statuses.join(','));
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    params.set('sort', sort);
    params.set('order', order);
    return params.toString();
  }

  const etagRef = useRef<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const realtimeEnabled = true;

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/tasks?${buildQuery()}`, { headers: etagRef.current ? { 'If-None-Match': etagRef.current } : undefined });
      if (res.status === 304) { // no changes
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const etag = res.headers.get('ETag');
      if (etag) etagRef.current = etag;
      const json = await res.json();
      setTasks(json.tasks || []);
      if (json.totalPages) setTotalPages(json.totalPages);
      if (json.total) setTotal(json.total);
    } catch (e:any) {
      const msg = (e && e.message) ? e.message : 'Failed';
      if (/forbidden/i.test(msg) || /not allowed/i.test(msg)) {
        setError('You do not have permission to view tasks.');
      } else {
        setError(msg);
      }
    } finally { setLoading(false); }
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) { /* ignore for now */ } finally { setUpdating(null); }
  }

  useEffect(() => { setPage(1); }, [scope, q, JSON.stringify(statuses), sort, order, pageSize]);
  useEffect(() => { load(); }, [scope, q, JSON.stringify(statuses), page, sort, order, pageSize]);

  // polling
  useEffect(() => {
    if (!refreshIntervalMs) return; 
    const id = setInterval(() => { load(); }, refreshIntervalMs);
    return () => clearInterval(id);
  }, [scope, q, JSON.stringify(statuses), page, sort, order, pageSize, refreshIntervalMs]);

  async function toggleComments(taskId: string) {
    setOpenComments(prev => ({ ...prev, [taskId]: !prev[taskId] }));
    if (!openComments[taskId]) {
      // load comments
      try {
        const res = await fetch(`/api/tasks/${taskId}/comments`);
        if (res.ok) {
          const json = await res.json();
          setComments(prev => ({ ...prev, [taskId]: json.comments || [] }));
        }
      } catch { /* ignore */ }
    }
  }

  async function submitComment(taskId: string) {
    const draft = commentDraft[taskId];
    if (!draft?.trim()) return;
    setCommentBusy(b => ({ ...b, [taskId]: true }));
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: draft }) });
      if (res.ok) {
        const json = await res.json();
        setComments(prev => ({ ...prev, [taskId]: [...(prev[taskId]||[]), json.comment] }));
        setCommentDraft(prev => ({ ...prev, [taskId]: '' }));
      }
    } finally { setCommentBusy(b => ({ ...b, [taskId]: false })); }
  }

  // SSE setup
  useEffect(() => {
    if (!realtimeEnabled) return;
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    const es = new EventSource('/api/tasks/events');
    esRef.current = es;
    const parse = (ev: Event) => { try { return JSON.parse((ev as MessageEvent).data); } catch { return null; } };
    es.addEventListener('task_created', ev => {
      const p = parse(ev); if (!p) return;
      if (page === 1 && sort === 'createdAt' && order === 'desc') {
        setTasks(prev => [p.data, ...prev].slice(0, pageSize));
      } else {
        load();
      }
    });
    es.addEventListener('task_updated', ev => { const p = parse(ev); if (!p) return; setTasks(prev => prev.map(t => t.id === p.data.id ? p.data : t)); });
    es.addEventListener('task_comment', () => { /* could badge */ });
    es.onerror = () => { /* reconnect naive */ setTimeout(()=>{ if (esRef.current === es) { es.close(); esRef.current = null; } }, 0); };
    return () => { es.close(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, JSON.stringify(statuses), q, sort, order, page, pageSize]);

  if (loading) return <div className="text-sm text-gray-500">Loading tasks...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  const noTasks = !tasks.length;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px] mb-1">
        <div className="flex items-center gap-1">Sort:
          <select aria-label="Sort tasks" value={sort} onChange={e=>setSort(e.target.value as any)} className="border rounded px-1 py-0.5 text-[11px]">
            <option value="createdAt">Created</option>
            <option value="updatedAt">Updated</option>
            <option value="status">Status</option>
          </select>
          <button onClick={()=>setOrder(o=>o==='asc'?'desc':'asc')} className="border rounded px-2 py-0.5 hover:bg-gray-50">{order==='asc'?'Asc':'Desc'}</button>
        </div>
        <div className="flex items-center gap-1">Page Size:
          <select aria-label="Page size" value={pageSize} onChange={e=>setPageSize(parseInt(e.target.value,10))} className="border rounded px-1 py-0.5 text-[11px]">
            {[10,20,50,100].map(ps=> <option key={ps} value={ps}>{ps}</option>)}
          </select>
        </div>
        <div className="ml-auto text-gray-500">{total} total</div>
      </div>
      {loading && <div className="text-sm text-gray-500">Loading tasks...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && noTasks && <div className="text-sm text-gray-500">No tasks.</div>}
      {!loading && !error && tasks.map(t => (
        <div key={t.id} className="border bg-white rounded p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800 text-sm">{t.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{t.status.replace('_',' ')}</span>
          </div>
          {t.description && <div className="text-xs text-gray-600 whitespace-pre-wrap">{t.description}</div>}
          <div className="flex flex-wrap gap-2 items-center mt-1">
            <span className="text-[11px] text-gray-500">Assignee: {t.assignee}</span>
            <span className="text-[11px] text-gray-400">Creator: {t.createdBy}</span>
            <div className="ml-auto flex gap-1">
              {t.status !== 'open' && <button onClick={()=>updateStatus(t.id,'open')} disabled={updating===t.id} className="text-[10px] px-2 py-0.5 border rounded hover:bg-gray-50 disabled:opacity-40">Reopen</button>}
              {t.status === 'open' && <button onClick={()=>updateStatus(t.id,'in_progress')} disabled={updating===t.id} className="text-[10px] px-2 py-0.5 border rounded hover:bg-gray-50 disabled:opacity-40">Start</button>}
              {t.status !== 'done' && <button onClick={()=>updateStatus(t.id,'done')} disabled={updating===t.id} className="text-[10px] px-2 py-0.5 border rounded bg-green-50 hover:bg-green-100 text-green-700 disabled:opacity-40">Complete</button>}
              <button onClick={()=>toggleComments(t.id)} className="text-[10px] px-2 py-0.5 border rounded hover:bg-gray-50">Comments</button>
            </div>
          </div>
          {openComments[t.id] && (
            <div className="mt-2 border-t pt-2 space-y-2">
              <div className="space-y-1 max-h-40 overflow-auto pr-1">
                {(comments[t.id]||[]).map(c => (
                  <div key={c.id} className="text-[11px] p-2 bg-gray-50 rounded border border-gray-100">
                    <div className="flex justify-between"><span className="font-medium text-gray-700">{c.author}</span><span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleString()}</span></div>
                    <div className="text-gray-600 whitespace-pre-wrap">{c.body}</div>
                  </div>
                ))}
                {(!comments[t.id] || comments[t.id].length===0) && <div className="text-[11px] text-gray-400">No comments yet.</div>}
              </div>
              <div className="flex gap-2">
                <input value={commentDraft[t.id]||''} onChange={e=>setCommentDraft(prev=>({...prev,[t.id]:e.target.value}))} placeholder="Add comment" className="flex-1 border rounded px-2 py-1 text-[11px]" />
                <button onClick={()=>submitComment(t.id)} disabled={commentBusy[t.id]} className="text-[11px] px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-40">{commentBusy[t.id]? '...' : 'Post'}</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t mt-2">
          <div className="text-[11px] text-gray-500">Page {page} of {totalPages}</div>
            <div className="flex gap-1">
              <button disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="text-[11px] px-2 py-0.5 border rounded disabled:opacity-40">Prev</button>
              <button disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="text-[11px] px-2 py-0.5 border rounded disabled:opacity-40">Next</button>
            </div>
        </div>
      )}
    </div>
  );
}
