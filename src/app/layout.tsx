import './globals.css';
import React, { type ReactNode } from 'react';

export const metadata = { title: 'SparQ Plug', description: 'SparQ Plug Portal' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
