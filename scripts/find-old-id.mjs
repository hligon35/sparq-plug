#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
const p=new PrismaClient();
const OLD='cmg3bu1730000mnt0xbe5w6xh';
try {
  const matches = await p.$queryRawUnsafe(`SELECT id,action,target,metadata FROM AuditEvent WHERE target LIKE '%${OLD}%' LIMIT 10`);
  console.log(matches);
} catch(e){console.error('Query failed',e);} finally {await p.$disconnect();}
