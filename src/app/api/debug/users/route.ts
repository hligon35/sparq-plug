import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({ take: 5, orderBy: { createdAt: 'asc' } });
    return NextResponse.json({
      ok: true,
      count: users.length,
      sample: users.map(u => ({ id: u.id, email: u.email, username: u.username, role: u.role })),
      databaseUrl: process.env.DATABASE_URL || 'undefined'
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, databaseUrl: process.env.DATABASE_URL || 'undefined' }, { status: 500 });
  }
}
