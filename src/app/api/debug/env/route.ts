import { NextResponse } from 'next/server';

export function GET() {
  const db = process.env.DATABASE_URL || 'undefined';
  return NextResponse.json({
    ok: true,
    databaseUrl: db,
    cwd: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    note: 'This endpoint is temporary for debugging and should be removed in production.'
  });
}
