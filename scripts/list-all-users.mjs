#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const users = await prisma.user.findMany();
for (const u of users) {
  console.log({ id: u.id, email: u.email, username: u.username, role: u.role });
}
await prisma.$disconnect();
