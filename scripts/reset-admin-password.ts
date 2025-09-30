#!/usr/bin/env ts-node
/**
 * Deterministically reset (or create) an admin user password.
 * Usage (example):  npx ts-node scripts/reset-admin-password.ts admin@example.com NewPass123!
 */
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const [,, email, newPassword] = process.argv;
  if (!email || !newPassword) {
    console.error('Usage: ts-node scripts/reset-admin-password.ts <email> <newPassword>');
    process.exit(1);
  }
  const hash = await bcrypt.hash(newPassword, 12);
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, passwordHash: hash, role: 'admin' } });
    console.log(`Created admin user ${email}`);
  } else {
    await prisma.user.update({ where: { email }, data: { passwordHash: hash } });
    console.log(`Updated password for existing user ${email}`);
  }
  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
