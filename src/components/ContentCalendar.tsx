"use client";
import Link from 'next/link';
import { hasBotFactoryAccessClient } from '@/features/bot_factory/access';

export default function ContentCalendar() {
  const allow = hasBotFactoryAccessClient();
  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-lg font-semibold">Content Calendar</h3>
        {allow && (
          <Link id="btn-produce-bot" href="/bots/new" className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none">
            Produce Bot
          </Link>
        )}
      </div>
      <div className="text-gray-500">[Calendar view coming soon]</div>
    </div>
  );
}
