#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'hligon@getsparqd.com';
  const username = process.env.SEED_ADMIN_USERNAME || 'hligon';
  const password = process.env.SEED_ADMIN_PASSWORD || 'sparqd2025';
  const role = 'admin';

  if (password.length < 8) {
    console.error('Refusing to seed: password must be at least 8 characters.');
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    console.log('Admin user already exists:', { id: existing.id, email: existing.email, username: existing.username, role: existing.role });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, username, role, passwordHash, name: 'Initial Admin' } });
  console.log('Seeded admin user:', { id: user.id, email: user.email, username: user.username, role: user.role });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
