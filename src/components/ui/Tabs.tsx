import { ReactNode } from 'react';
import clsx from 'clsx';

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
  hidden?: boolean;
  badge?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
  'aria-label'?: string;
}

export function Tabs({ items, active, onChange, variant='pills', className, ...rest }: TabsProps) {
  const visible = items.filter(i => !i.hidden);
  return (
    <div role="tablist" {...rest} className={clsx('flex flex-wrap gap-3', className)}>
      {visible.map(item => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            role="tab"
            aria-current={isActive ? 'page' : undefined}
            aria-controls={`panel-${item.key}`}
            id={`tab-${item.key}`}
            disabled={item.disabled}
            onClick={() => onChange(item.key)}
            className={clsx(
              'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all border shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40',
              isActive ? 'bg-white text-blue-700 border-blue-200 shadow-md ring-1 ring-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:shadow-md hover:-translate-y-[1px]',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className={clsx('w-2 h-2 rounded-full', isActive ? 'bg-blue-600' : 'bg-gray-300')} />
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;