#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  const rows = await p.$queryRawUnsafe('SELECT id,email,username,role,passwordHash FROM User');
  for (const r of rows) console.log(r);
} catch (e) { console.error('Raw query failed', e); }
finally { await p.$disconnect(); }
