"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ContentCalendar() {
  // Produce Bot button removed per request.
  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-lg font-semibold">Content Calendar</h3>
        {/* Produce Bot button removed per request */}
      </div>
      <div className="text-gray-500">[Calendar view coming soon]</div>
    </div>
  );
}
