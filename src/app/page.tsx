// Main landing page for the app
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
        <Image src="/images/SparQLogo.png" alt="SparQ Logo" width={100} height={100} className="mb-4" />
        <h1 className="text-4xl font-bold mb-6 text-blue-900">Welcome to SparQ</h1>
        <Link href="/login" className="px-8 py-3 bg-blue-700 text-white rounded font-semibold hover:bg-blue-800 transition text-lg mb-2">Login</Link>
        <p className="mt-4 text-gray-500">Sign in to access your dashboard.</p>
      </div>
    </main>
  );
}
