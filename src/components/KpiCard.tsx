"use client";
import clsx from 'clsx';

interface KpiCardProps {
  value: string | number;
  label: string;
  delta?: string; // e.g. "+12%"
  gradient?: 'blue' | 'green' | 'purple' | 'orange';
  size?: 'sm' | 'md';
}

const map: Record<string,string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600'
};

export default function KpiCard({ value, label, delta, gradient='blue', size='md' }: KpiCardProps) {
  return (
    <div className={clsx('bg-gradient-to-br rounded-2xl text-white shadow-lg', map[gradient], size==='md' ? 'p-6' : 'p-4')}>
      <div className="text-center">
        <div className={clsx('font-bold mb-1', size==='md' ? 'text-4xl' : 'text-2xl')}>{value}</div>
        <div className="text-white/90 text-sm font-medium">{label}</div>
        {delta && <div className="text-white/70 text-xs mt-1">{delta} vs last period</div>}
      </div>
    </div>
  );
}
