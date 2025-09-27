import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in dev hot-reload
const globalForPrisma = global as any as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
