"use client";
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TEST_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'client', password: 'client123', role: 'client' },
  { username: 'manager', password: 'manager123', role: 'manager' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const user = TEST_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      setError('');
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'manager') router.push('/manager');
      else router.push('/client');
    } else {
      setError('Invalid credentials');
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#da0c43] via-[#f4a728] to-[#1a7ad9]">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-12 w-full max-w-lg flex flex-col items-center border-2 border-[#c47c2c] backdrop-blur-md">
        <Image src="/images/SparQLogo.png" alt="SparQ Logo" width={240} height={240} className="mb-8 drop-shadow-lg" />
        <h1 className="text-4xl font-extrabold mb-8 text-[#da0c43] tracking-tight drop-shadow text-center w-full">Welcome To SparQ Plug</h1>
        <form className="w-full space-y-6 flex flex-col items-center" onSubmit={handleLogin}>
          <div>
            <label className="block mb-2 font-semibold text-[#1a7ad9]">Username</label>
            <input
              className="p-3 border-2 border-[#c47c2c] rounded-lg w-3/4 max-w-xs focus:ring-4 focus:ring-[#f4a728] focus:border-[#f4a728] bg-[#f9f6f2] text-[#1a7ad9] placeholder-[#c47c2c] transition mx-auto"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-[#1a7ad9]">Password</label>
            <div className="relative w-3/4 max-w-xs mx-auto">
              <input
                className="p-3 border-2 border-[#c47c2c] rounded-lg w-full focus:ring-4 focus:ring-[#f4a728] focus:border-[#f4a728] bg-[#f9f6f2] text-[#1a7ad9] placeholder-[#c47c2c] transition pr-12"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#c47c2c] hover:text-[#1a7ad9] transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {error && <div className="text-[#da0c43] text-sm font-medium text-center">{error}</div>}
          <button
            type="submit"
            className="w-3/4 max-w-xs py-3 bg-gradient-to-r from-[#da0c43] via-[#f4a728] to-[#1a7ad9] text-white rounded-lg font-bold text-lg shadow-md hover:from-[#c47c2c] hover:to-[#da0c43] transition mx-auto border-2 border-[#c47c2c]"
          >
            Login
          </button>
        </form>
        <div className="mt-8 text-sm text-[#c47c2c] w-150px bg-[#f9f6f2] rounded-lg p-4 border-2 border-[#f4a728] shadow-inner">
          <div className="font-semibold mb-1 text-[#da0c43]">Test credentials:</div>
          <div>Admin: <b className="text-[#1a7ad9]">admin</b> / <b className="text-[#1a7ad9]">admin123</b></div>
          <div>Manager: <b className="text-[#1a7ad9]">manager</b> / <b className="text-[#1a7ad9]">manager123</b></div>
          <div>Client: <b className="text-[#1a7ad9]">client</b> / <b className="text-[#1a7ad9]">client123</b></div>
        </div>
      </div>
    </main>
  );
}
