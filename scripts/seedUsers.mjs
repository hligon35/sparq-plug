#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.mjs';

async function main() {
  const users = [
    { email: 'admin@example.com', role: 'admin', password: 'ChangeMe123!' },
    { email: 'manager@example.com', role: 'manager', password: 'ChangeMe123!' },
    { email: 'client@example.com', role: 'client', password: 'ChangeMe123!' },
  ];
  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (exists) { console.log('Skip existing', u.email); continue; }
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.create({ data: { email: u.email, passwordHash, role: u.role } });
    console.log('Created user', u.email);
  }
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
