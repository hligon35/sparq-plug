import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.redirect(new URL('/app/login', process.env.NEXT_PUBLIC_ORIGIN || 'http://localhost:3000'));
  res.cookies.set({ name: 'session', value: '', path: '/', httpOnly: true, maxAge: 0 });
  return res;
}
