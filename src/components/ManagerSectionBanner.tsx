"use client";

import React from 'react';
import clsx from 'clsx';

type Variant = 'blue' | 'purple' | 'indigo' | 'teal' | 'orange' | 'green';

const variantClasses: Record<Variant,string> = {
  blue: 'from-blue-600 to-blue-700',
  purple: 'from-purple-600 to-indigo-600',
  indigo: 'from-indigo-600 to-sky-600',
  teal: 'from-teal-600 to-cyan-600',
  orange: 'from-orange-500 to-amber-600',
  green: 'from-emerald-600 to-green-600'
};

export interface ManagerSectionBannerProps {
  title: string;
  subtitle?: string;
  icon?: string; // emoji or short text
  variant?: Variant;
  className?: string;
  actions?: React.ReactNode;
}

export default function ManagerSectionBanner({
  title,
  subtitle,
  icon = '📌',
  variant = 'blue',
  className,
  actions
}: ManagerSectionBannerProps) {
  return (
    <div className={clsx('relative overflow-hidden rounded-2xl mb-8 shadow', className)}>
      <div className={clsx('bg-gradient-to-br p-6 md:p-8 text-white', variantClasses[variant])}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl" aria-hidden="true">{icon}</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="text-white/80 text-sm md:text-base mt-1 max-w-2xl">{subtitle}</p>}
            </div>
          </div>
          {actions && (
            <div className="flex-shrink-0 flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
