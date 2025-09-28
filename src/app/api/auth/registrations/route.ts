import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await verifySession(req.cookies.get('session')?.value);
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'pending') as 'pending' | 'approved' | 'denied';
  const items = await prisma.registrationRequest.findMany({ where: { status }, orderBy: { createdAt: 'asc' }, take: 200 });
  return NextResponse.json({ items });
}