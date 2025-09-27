import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, company } = body || {};
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const existsUser = await prisma.user.findUnique({ where: { email } });
    const existingPending = await prisma.registrationRequest.findFirst({ where: { email, status: 'pending' } });
    if (existsUser) return NextResponse.json({ error: 'Account already exists' }, { status: 409 });
    if (existingPending) return NextResponse.json({ error: 'A pending request already exists' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.registrationRequest.create({ data: { email, name, company, roleRequested: role, passwordHash } });
    return NextResponse.json({ ok: true, message: 'Registration submitted for approval' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
