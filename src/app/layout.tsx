import './globals.css';
import { ReactNode } from 'react';
import Script from 'next/script';
import { publicBasePath, withBasePath } from '@/lib/basePath';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-[#f5f7fb]">
      <body className="min-h-screen bg-[#f5f7fb] text-gray-900 antialiased overflow-x-hidden">
        <div className="app-viewport">
          {/* Page content should grow and scroll within viewport; enable touch swipe scroll */}
          <div className="flex-1 min-h-0 min-w-0 swipe-y">
            {children}
          </div>
        </div>
        {/* SparQy assistant script and init */}
        <Script src={withBasePath('/sparqy.js')} strategy="afterInteractive" />
        <Script id="sparqy-init" strategy="afterInteractive">
          {`
            (function(){
              function init(){
                try {
                  if (typeof window !== 'undefined' && typeof window.initSparqyAssistant === 'function') {
                    window.initSparqyAssistant({ basePath: '${publicBasePath}' });
                  }
                } catch (e) { /* noop */ }
              }
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init, { once: true });
              } else {
                init();
              }
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
