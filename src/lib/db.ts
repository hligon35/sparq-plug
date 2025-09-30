import { PrismaClient } from '@prisma/client';
// Prevent multiple instances in dev
const g: any = globalThis as any;
export const prisma: PrismaClient = g.__sparq_prisma || new PrismaClient();
if (!g.__sparq_prisma) g.__sparq_prisma = prisma;
