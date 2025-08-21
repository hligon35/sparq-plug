import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-[#f5f7fb]">
      <body className="min-h-screen bg-[#f5f7fb] text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
