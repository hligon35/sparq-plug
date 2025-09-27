'use client';
import Header from '@/components/Header';
import ManagerTopNav from '@/components/ManagerTopNav';
import TaskList from '@/components/TaskList';
import TaskCreate from '@/components/TaskCreate';
import { useState } from 'react';

export default function ManagerTasksPage() {
  const [scope, setScope] = useState<'mine'|'all'>('mine');
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Header title="Tasks" subtitle="Manage and complete assigned work" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManagerTopNav active={'tasks'} onChange={(k)=>{ if (k==='tasks') return; if (k==='dashboard') window.location.href='/manager'; else window.location.href=`/manager/${k}`; }} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">{scope === 'mine' ? 'My Tasks' : 'All Tasks'}</h2>
                <div className="flex gap-2">
                  <button onClick={()=>setScope('mine')} className={`text-xs px-3 py-1 rounded-full border ${scope==='mine'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>Mine</button>
                  <button onClick={()=>setScope('all')} className={`text-xs px-3 py-1 rounded-full border ${scope==='all'?'bg-blue-600 text-white border-blue-600':'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>All</button>
                </div>
              </div>
              <TaskList scope={scope} />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <TaskCreate />
          </div>
        </div>
      </div>
    </div>
  );
}
