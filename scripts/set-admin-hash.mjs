#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const p=new PrismaClient();
const password=process.argv[2];
if(!password){console.error('Usage: node scripts/set-admin-hash.mjs <newPassword>');process.exit(1);} 
try {
  const rounds=parseInt(process.env.BCRYPT_ROUNDS||'12',10);
  const hash=await bcrypt.hash(password,rounds);
  const user=await p.user.update({ where:{ email:'hligon@getsparqd.com' }, data:{ passwordHash: hash }});
  console.log('Password updated. Hash prefix:', hash.slice(0,20));
} catch(e){console.error('Update failed',e);} finally {await p.$disconnect();}
