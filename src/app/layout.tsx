import './globals.css';
import { ReactNode } from 'react';
import Script from 'next/script';
import { publicBasePath, withBasePath } from '@/lib/basePath';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://sparqplug.getsparqd.com'),
  title: { default: 'SparQ Plug', template: '%s | SparQ Plug' },
  description: 'SparQ Digital client portal for admins, managers, and clients.',
  openGraph: {
    type: 'website',
    siteName: 'SparQ Plug',
    title: 'SparQ Plug',
    description: 'Client portal',
    url: 'https://sparqplug.getsparqd.com',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://sparqplug.getsparqd.com' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-[#f5f7fb]">
      <body className="min-h-screen bg-[#f5f7fb] text-gray-900 antialiased">
        {children}
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
