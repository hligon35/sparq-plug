// Global styles (Tailwind + custom properties)
// @ts-ignore - side-effect global stylesheet
import './globals.css';
import { ReactNode } from 'react';
import ClientAppFrame from '@/components/ClientAppFrame';
import Script from 'next/script';
import { publicBasePath, withBasePath } from '@/lib/basePath';
import RootErrorBoundary from '@/components/RootErrorBoundary';
import { GlobalToastProvider } from '@/components/GlobalToasts';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-[#f5f7fb]">
      <body className="min-h-screen bg-[#f5f7fb] text-gray-900 antialiased overflow-x-hidden">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded">Skip to content</a>
        <RootErrorBoundary>
          <GlobalToastProvider>
            <main id="main" className="app-viewport flex-1 min-h-0 min-w-0 swipe-y outline-none">
              <ClientAppFrame>
                {children}
              </ClientAppFrame>
            </main>
          </GlobalToastProvider>
        </RootErrorBoundary>
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
