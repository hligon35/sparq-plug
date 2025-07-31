import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TEST_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'client', password: 'client123', role: 'client' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const user = TEST_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      setError('');
      if (user.role === 'admin') router.push('/admin');
      else router.push('/client');
    } else {
      setError('Invalid credentials');
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <Image src="/images/SparQLogo.png" alt="SparQ Logo" width={80} height={80} className="mb-4" />
        <h1 className="text-2xl font-bold mb-6 text-blue-900">SparQ Login</h1>
        <form className="w-full" onSubmit={handleLogin}>
          <label className="block mb-2 font-medium text-blue-900">Username</label>
          <input
            className="mb-4 p-2 border rounded w-full focus:ring-2 focus:ring-blue-400"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            required
          />
          <label className="block mb-2 font-medium text-blue-900">Password</label>
          <input
            className="mb-4 p-2 border rounded w-full focus:ring-2 focus:ring-blue-400"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-blue-700 text-white rounded font-semibold hover:bg-blue-800 transition"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-xs text-gray-500 w-full">
          <div>Test credentials:</div>
          <div>Admin: <b>admin</b> / <b>admin123</b></div>
          <div>Client: <b>client</b> / <b>client123</b></div>
        </div>
      </div>
    </main>
  );
}
