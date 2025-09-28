import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get('session')?.value);
  if (!session) return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { id: true, email: true, role: true, name: true, company: true, createdAt: true } });
  return NextResponse.json({ user });
}
