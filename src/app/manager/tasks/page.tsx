'use client';
import ManagerLayout from '@/components/ManagerLayout';
import TaskList from '@/components/TaskList';
import TaskCreate from '@/components/TaskCreate';
import ManagerSectionBanner from '@/components/ManagerSectionBanner';
import { useState } from 'react';

export default function ManagerTasksPage() {
  const [scope, setScope] = useState<'mine'|'all'>('mine');
  const [q, setQ] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  function toggleStatus(s: string) { setStatusFilters(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]); }
  return (
    <ManagerLayout active="tasks" headerSubtitle="Manage and complete assigned work">
      <ManagerSectionBanner
          icon="✅"
          title="Task Center"
          subtitle="Track, prioritize and complete work across clients and internal operations"
          variant="indigo"
        />
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Task workspace">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">{scope === 'mine' ? 'My Tasks' : 'All Tasks'}</h2>
                  <div className="flex gap-2">
                    <button onClick={()=>setScope('mine')} className={`text-xs px-3 py-1 rounded-full border ${scope==='mine'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Mine</button>
                    <button onClick={()=>setScope('all')} className={`text-xs px-3 py-1 rounded-full border ${scope==='all'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>All</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center" aria-label="Task search and status filters">
                  <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search" className="border px-3 py-1 rounded text-sm" />
                  <div className="flex gap-2 text-[11px]">
                    {['open','in_progress','done'].map(s => (
                      <button key={s} onClick={()=>toggleStatus(s)} className={`px-2 py-1 rounded border capitalize ${statusFilters.includes(s)?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{s.replace('_',' ')}</button>
                    ))}
                    {statusFilters.length>0 && <button onClick={()=>setStatusFilters([])} className="px-2 py-1 rounded border text-gray-600">Clear</button>}
                  </div>
                </div>
              </div>
              <TaskList scope={scope} q={q} statuses={statusFilters} />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <TaskCreate />
          </div>
      </div>
    </ManagerLayout>
  );
}
