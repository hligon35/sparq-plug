"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const isDev = process.env.NODE_ENV === 'development' || 
                typeof window !== 'undefined' && 
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, [router]);

  return <main className="min-h-screen bg-[#f5f7fb] flex items-center justify-center p-6">
    <div className="text-gray-600 text-sm">Redirecting to login…</div>
  </main>;
}
