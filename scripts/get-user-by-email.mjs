#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
const p=new PrismaClient();
const email=process.argv[2];
if(!email){console.error('Usage: node scripts/get-user-by-email.mjs <email>');process.exit(1);} 
try { const u=await p.user.findUnique({ where:{ email }}); console.log(u); } catch(e){ console.error(e);} finally { await p.$disconnect(); }
