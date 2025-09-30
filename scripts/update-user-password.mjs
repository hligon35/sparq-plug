#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main(){
  const [,, userId, newPassword] = process.argv;
  if(!userId || !newPassword){
    console.error('Usage: node scripts/update-user-password.mjs <userId> <newPassword>');
    process.exit(1);
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if(!user){
    console.error('No user found with id', userId);
    process.exit(2);
  }
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12',10);
  const hash = await bcrypt.hash(newPassword, rounds);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  console.log('Updated password for user', { id: user.id, email: user.email, username: user.username });
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(async()=>{await prisma.$disconnect();});
