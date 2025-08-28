"use client";
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const rt = encodeURIComponent(window.location.href);
    const target = `https://portal.getsparqd.com/login.html?sso=1&returnTo=${rt}`;
    window.location.replace(target);
  }, []);
  return (
    <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">Redirecting to Portal Login…</h1>
        <p className="text-gray-600 mb-4">Please sign in via the SparQ Portal.</p>
        <a
          href="https://portal.getsparqd.com/login.html"
          className="inline-block px-4 py-2 bg-[#1d74d0] text-white rounded-lg"
        >
          Open Portal Login
        </a>
      </div>
    </main>
  );
}
