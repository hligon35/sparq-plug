"use client";
import { managerRouteMap, ManagerTabKey } from '@/lib/managerNav';
import dynamic from 'next/dynamic';

export type ManagerNavTab = {
  key: ManagerTabKey;
  label: string;
  hidden?: boolean; // future gating
};

const TasksCountBadge = dynamic(() => import('./TasksCountBadge'), { ssr: false });

// Single source of truth for tab ordering/labels. Keys must match managerRouteMap.
const tabs: ManagerNavTab[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'clients', label: 'Clients' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'settings', label: 'Settings' }
];

export default function ManagerTopNav({ active, onChange }: { active: ManagerTabKey; onChange: (key: ManagerTabKey) => void }) {
  return (
    <div className="mb-8 overflow-x-auto" role="navigation" aria-label="Manager primary navigation">
      <nav className="flex items-center gap-3 p-2 min-w-max">
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                isActive
                  ? 'bg-white text-blue-700 border-blue-200 shadow-md ring-1 ring-blue-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:shadow-md hover:-translate-y-[1px]'
              }`}
              aria-current={isActive ? 'page' : undefined}
              data-route={managerRouteMap[t.key]}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
              {t.label}
              {t.key === 'tasks' && <TasksCountBadge />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
