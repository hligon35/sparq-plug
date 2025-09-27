'use client';
import { useState } from 'react';

interface Props { onCreated?: () => void }

export default function TaskCreate({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!title.trim() || !assignee.trim()) { setError('Title & assignee required'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, assignee, description }) });
      if (!res.ok) throw new Error(await res.text());
      setTitle(''); setAssignee(''); setDescription('');
      onCreated?.();
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setBusy(false); }
  }

  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <h4 className="font-semibold text-gray-700">Create Task</h4>
      <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Assignee (email or id)" value={assignee} onChange={e=>setAssignee(e.target.value)} />
      <textarea className="w-full border rounded px-3 py-2 text-sm" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} rows={3} />
      {error && <div className="text-red-600 text-xs">{error}</div>}
      <button onClick={submit} disabled={busy} className="bg-blue-600 text-white text-sm px-4 py-2 rounded disabled:opacity-50">{busy ? 'Creating...' : 'Add Task'}</button>
    </div>
  );
}
