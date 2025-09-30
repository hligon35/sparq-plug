#!/usr/bin/env node
// Seed exactly two admin users (idempotent upsert) using Prisma.
// Configuration (env overrides):
//   ADMIN1_EMAIL / ADMIN1_PASSWORD
//   ADMIN2_EMAIL / ADMIN2_PASSWORD
// If passwords are omitted, random strong passwords are generated and printed.
// NOTE: Generated plaintext passwords are ONLY printed to stdout during this run; not stored elsewhere.

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../src/lib/prisma.mjs';

function strongPassword() {
  return crypto.randomBytes(12).toString('base64url');
}

// Target admins requested by user. If env vars provided they override these defaults.
const admins = [
  {
    email: process.env.ADMIN1_EMAIL || 'hligon@getsparqd.com',
    password: process.env.ADMIN1_PASSWORD || 'sparqd2025',
    name: 'hligon'
  },
  {
    email: process.env.ADMIN2_EMAIL || 'bhall@getsparqd.com',
    password: process.env.ADMIN2_PASSWORD || 'sparqd2025',
    name: 'bhall'
  }
];

async function main() {
  console.log('[seedAdmins] Seeding up to 2 admin users...');
  for (const a of admins) {
    const existing = await prisma.user.findUnique({ where: { email: a.email } });
    if (existing) {
      if (existing.role !== 'admin') {
        await prisma.user.update({ where: { email: a.email }, data: { role: 'admin' } });
        console.log(`  -> Updated role to admin for existing user ${a.email}`);
      } else {
        console.log(`  -> Skipped existing admin ${a.email}`);
      }
      continue;
    }
    const passwordHash = await bcrypt.hash(a.password, 12);
    await prisma.user.create({ data: { email: a.email, passwordHash, role: 'admin', name: a.name } });
    console.log(`  -> Created admin ${a.email}  PASSWORD=${a.password}`);
  }
  await prisma.$disconnect();
  console.log('[seedAdmins] Done.');
}

main().catch(e => { console.error('[seedAdmins] Failed:', e); process.exit(1); });
