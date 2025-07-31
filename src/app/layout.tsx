import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400">
          {children}
        </div>
      </body>
    </html>
  );
}
