'use client';
import { useEffect, useState } from 'react';

interface Metrics { openAssigned: number; inProgressAssigned: number; totalOpenAssigned: number }

export default function TasksCountBadge({ refreshMs = 30000 }: { refreshMs?: number }) {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/tasks/metrics', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const json: Metrics = await res.json();
      setCount(json.totalOpenAssigned);
      setError(false);
    } catch {
      setError(true);
    }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { if (!refreshMs) return; const id = setInterval(load, refreshMs); return () => clearInterval(id); }, [refreshMs]);

  if (error) return <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">!</span>;
  if (count === null) return <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">…</span>;
  if (count === 0) return null;
  return (
    <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white shadow-sm">
      {count}
    </span>
  );
}
