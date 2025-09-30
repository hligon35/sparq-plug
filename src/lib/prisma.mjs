import { PrismaClient } from '@prisma/client';

// Simple JS wrapper for seeding scripts (ESM .mjs) since they cannot import the TypeScript file directly.
// Avoid multiple instances in dev reruns.
const globalForPrisma = globalThis;
if (!globalForPrisma.__prisma) {
  globalForPrisma.__prisma = new PrismaClient();
}
export const prisma = globalForPrisma.__prisma;
