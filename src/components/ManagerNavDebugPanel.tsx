"use client";
import React, { useState } from 'react';
import useManagerNavAnalytics from '@/hooks/useManagerNavAnalytics';

/**
 * Collapsible developer-only panel to visualize manager navigation events.
 * Include conditionally in pages (e.g., only in development) to inspect navigation flow.
 */
export function ManagerNavDebugPanel() {
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const events = useManagerNavAnalytics({
    max: 500,
    onEvent: (e) => {
      if (paused) return;
      setLocalEvents(prev => {
        const next = [...prev, e];
        if (next.length > 500) next.splice(0, next.length - 500);
        return next;
      });
    }
  });
  return (
    <div className="fixed bottom-4 right-4 z-[1100] text-xs font-mono">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="px-3 py-1 rounded-t-lg bg-gray-800 text-white shadow-lg hover:bg-gray-700"
        data-expanded={open ? 'true' : 'false'}
      >
        Nav Events ({localEvents.length}) {open ? '▼' : '▲'}
      </button>
      {open && (
        <div className="max-h-[22rem] w-96 overflow-hidden bg-white border border-gray-300 shadow-xl rounded-b-lg flex flex-col">
          <div className="flex items-center gap-2 p-2 border-b bg-gray-50">
            <button
              onClick={() => setPaused(p => !p)}
              className={`px-2 py-1 rounded text-xs font-medium border ${paused ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-green-100 border-green-300 text-green-800'}`}
            >
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={() => setLocalEvents([])}
              className="px-2 py-1 rounded text-xs font-medium border bg-red-100 border-red-300 text-red-700"
            >
              Clear
            </button>
            <span className="ml-auto text-[10px] text-gray-500">Newest first</span>
          </div>
          <div className="overflow-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead className="bg-gray-50 text-gray-600 sticky top-0">
              <tr>
                <th className="p-1 text-left">Tab</th>
                <th className="p-1 text-left">Method</th>
                <th className="p-1 text-left">Internal</th>
                <th className="p-1 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {localEvents.slice().reverse().map((e, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="p-1">{e.tab}</td>
                  <td className="p-1">{e.method}</td>
                  <td className="p-1">{e.internal ? 'yes' : ''}</td>
                  <td className="p-1 whitespace-nowrap">{new Date(e.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
              {localEvents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-2 text-center text-gray-500">No events yet</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerNavDebugPanel;
