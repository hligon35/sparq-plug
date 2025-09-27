'use client';
import { useEffect, useState } from 'react';

interface Task { id: string; title: string; description?: string; status: string; assignee: string; createdBy: string; createdAt: string; updatedAt: string; }

interface Props { scope?: 'mine' | 'all' }

export default function TaskList({ scope = 'mine' }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/tasks?scope=${scope}`);
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

  useEffect(() => { load(); }, [scope]);

  if (loading) return <div className="text-sm text-gray-500">Loading tasks...</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!tasks.length) return <div className="text-sm text-gray-500">No tasks.</div>;

  return (
    <div className="space-y-3">
      {tasks.map(t => (
        <div key={t.id} className="border bg-white rounded p-3 flex flex-col gap-1">
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
