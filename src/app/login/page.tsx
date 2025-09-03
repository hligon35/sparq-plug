"use client";
import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
  const rt = encodeURIComponent(window.location.href.replace('/login', ''));
  const target = `https://portal.getsparqd.com/login?sso=1&returnTo=${rt}`;
    window.location.replace(target);
  }, []);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fb] px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-lg text-center border border-gray-200">
        <h1 className="text-2xl font-semibold text-[#1d74d0] mb-4">Redirecting to Portal Login…</h1>
  <a href="https://portal.getsparqd.com/login?sso=1" className="inline-block px-4 py-2 bg-[#1d74d0] text-white rounded-lg">Open Portal Login</a>
      </div>
    </main>
  );
}
