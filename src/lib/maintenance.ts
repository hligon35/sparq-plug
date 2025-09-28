import { prisma } from '@/lib/prisma';

let lastTokenCleanup = 0;
const TOKEN_CLEAN_INTERVAL = 60 * 60 * 1000; // 1 hour

export async function scheduleMaintenance() {
  const now = Date.now();
  if (now - lastTokenCleanup > TOKEN_CLEAN_INTERVAL) {
    lastTokenCleanup = now;
    // fire & forget cleanup of expired password reset tokens older than 24h beyond expiry
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    prisma.passwordResetToken.deleteMany({
      where: { OR: [ { expiresAt: { lt: new Date() } }, { usedAt: { not: null } } ] }
    }).catch(() => {});
  }
}

// Hook invocation: call scheduleMaintenance() at safe points (e.g., auth routes) without awaiting.