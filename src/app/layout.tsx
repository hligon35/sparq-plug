import './globals.css';
import { ReactNode, ErrorInfo } from 'react';
import Script from 'next/script';
import { publicBasePath, withBasePath } from '@/lib/basePath';
import { ErrorBoundary } from 'react-error-boundary';
import { rootLogger } from '@/core/logger';

function GlobalErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-6 break-all">{error.message}</p>
        <button onClick={resetErrorBoundary} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Reload</button>
      </div>
    </div>
  );
}

function onError(error: Error, info: ErrorInfo) {
  rootLogger.error('react.error_boundary', { message: error.message, stack: error.stack, componentStack: info.componentStack || null });
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-[#f5f7fb]">
      <body className="min-h-screen bg-[#f5f7fb] text-gray-900 antialiased overflow-x-hidden">
        <ErrorBoundary FallbackComponent={GlobalErrorFallback} onError={onError}>
          <div className="app-viewport">
            <div className="flex-1 min-h-0 min-w-0 swipe-y">
              {children}
            </div>
          </div>
        </ErrorBoundary>
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
