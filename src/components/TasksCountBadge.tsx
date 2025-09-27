'use client';
import React, { useEffect, useState } from 'react';

interface Metrics { openAssigned: number; inProgressAssigned: number; totalOpenAssigned: number }

export interface TasksCountBadgeProps { refreshMs?: number; fetchImpl?: typeof fetch; reloadToken?: number }

export default function TasksCountBadge({ refreshMs = 30000, fetchImpl, reloadToken }: TasksCountBadgeProps) {
  const [count, setCount] = useState<number | null>(null);
  const [prev, setPrev] = useState<number | null>(null);
  const [delta, setDelta] = useState<number>(0);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  async function load() {
    try {
  const f = fetchImpl || fetch;
  const res = await f('/api/tasks/metrics', { cache: 'no-store' } as any);
      if (!res.ok) throw new Error();
      const json: Metrics = await res.json();
      setPrev(count);
      setCount(json.totalOpenAssigned);
      if (count !== null && json.totalOpenAssigned !== count) {
        setDelta(json.totalOpenAssigned - count);
        setFlash(true);
        setTimeout(() => setFlash(false), 1500);
      }
      setUpdatedAt(Date.now());
      setError(false);
      // persist
      try {
        sessionStorage.setItem('tasksBadge:last', JSON.stringify({ c: json.totalOpenAssigned, t: Date.now() }));
      } catch {}
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    // hydrate from sessionStorage
    try {
      const raw = sessionStorage.getItem('tasksBadge:last');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.c === 'number') {
          setCount(parsed.c);
          setPrev(parsed.c);
          setUpdatedAt(parsed.t || null);
        }
      }
    } catch {}
    load();
  }, []);
  useEffect(() => { if (!refreshMs) return; const id = setInterval(load, refreshMs); return () => clearInterval(id); }, [refreshMs]);
  // deterministic external trigger for tests
  useEffect(() => { if (reloadToken !== undefined) load(); }, [reloadToken]);

  if (error) return <span aria-label="Task count error" className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">!</span>;
  if (count === null) return <span aria-label="Loading task count" className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">…</span>;
  if (count === 0) return null;

  const showDelta = delta !== 0 && prev !== null;
  const deltaColor = delta > 0 ? 'text-red-100 bg-red-500' : 'text-green-100 bg-green-600';
  const deltaSign = delta > 0 ? '+' : '';

  return (
    <span
      className={`ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white shadow-sm transition-shadow ${flash ? 'ring-2 ring-offset-1 ring-blue-300 shadow-blue-300/50' : ''}`}
      aria-label={`Open tasks: ${count}${showDelta ? ` (${deltaSign}${delta} since last update)` : ''}`}
      title={updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : 'Task counts'}
    >
      {count}
      {showDelta && (
        <span className={`ml-0.5 px-1 rounded ${deltaColor} font-bold`}>{deltaSign}{delta}</span>
      )}
    </span>
  );
}
