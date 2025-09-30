#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main(){
  const identifier = process.argv[2];
  const newPassword = process.argv[3];
  if(!identifier || !newPassword){
    console.error('Usage: node scripts/reset-password.mjs <email|username> <newPassword>');
    process.exit(1);
  }
  const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } });
  if(!user){
    console.error('User not found for', identifier);
    process.exit(2);
  }
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12',10);
  const hash = await bcrypt.hash(newPassword, rounds);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  console.log('Password reset for', identifier);
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(async()=>{await prisma.$disconnect();});
