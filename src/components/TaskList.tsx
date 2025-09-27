'use client';
import { useEffect, useState } from 'react';

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

  function buildQuery() {
    const params = new URLSearchParams();
    params.set('scope', scope);
    if (q) params.set('q', q);
    if (statuses && statuses.length) params.set('status', statuses.join(','));
    return params.toString();
  }

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/tasks?${buildQuery()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setTasks(json.tasks || []);
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) { /* ignore for now */ } finally { setUpdating(null); }
  }

  useEffect(() => { load(); }, [scope, q, JSON.stringify(statuses)]);

  // polling
  useEffect(() => {
    if (!refreshIntervalMs) return; 
    const id = setInterval(() => { load(); }, refreshIntervalMs);
    return () => clearInterval(id);
  }, [scope, q, JSON.stringify(statuses), refreshIntervalMs]);

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

  if (loading) return <div className="text-sm text-gray-500">Loading tasks...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!tasks.length) return <div className="text-sm text-gray-500">No tasks.</div>;

  return (
    <div className="space-y-3">
      {tasks.map(t => (
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
    </div>
  );
}
