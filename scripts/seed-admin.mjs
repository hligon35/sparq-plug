#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const username = process.env.ADMIN_USERNAME || (email.includes('@') ? email.split('@')[0] : email);
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE || 'admin';
  if (!password) {
    console.error('Set ADMIN_PASSWORD before running seed');
    process.exit(1);
  }
  const rounds = parseInt(process.env.ADMIN_BCRYPT_ROUNDS || '12', 10);
  const hash = await bcrypt.hash(password, rounds);
  const user = await prisma.user.upsert({
    where: { email },
    update: { username, passwordHash: hash, role },
    create: { email, username, passwordHash: hash, role },
  });
  console.log('Seeded admin:', { id: user.id, email: user.email, username: user.username, role: user.role });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
