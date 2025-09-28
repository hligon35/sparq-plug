// Notifications & Alerts placeholder
import { useEffect, useState } from 'react';

interface NotificationItem { id: string; message: string; createdAt: string; read: boolean; type: string; taskId?: string }

export default function Notifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setItems(json.notifications || []);
      setError(null);
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  }

  async function markAllRead() {
    setMarking(true);
    try {
      await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      await load();
    } catch { /* ignore */ } finally { setMarking(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white rounded shadow p-4 mb-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <button onClick={markAllRead} disabled={marking} className="text-xs text-blue-600 hover:underline disabled:opacity-40">Mark all read</button>
      </div>
      {loading && <div className="text-gray-500 text-sm">Loading...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!loading && !items.length && <div className="text-gray-500 text-sm">No notifications</div>}
      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {items.map(n => (
          <div key={n.id} className={`p-2 rounded border text-sm flex flex-col gap-0.5 ${n.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}> 
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-800 flex-1 mr-2">{n.message}</span>
              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />}
            </div>
            <div className="text-[10px] text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

