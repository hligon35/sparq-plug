#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
try {
  const users = await prisma.user.findMany();
  console.log('User count:', users.length);
  for (const u of users) {
    console.log({ id: u.id, email: u.email, username: u.username, role: u.role, hash: (u.passwordHash||'').slice(0,10)+'...' });
  }
} catch (e) {
  console.error('Error listing users:', e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
