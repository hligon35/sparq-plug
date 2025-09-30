const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    const users = await p.user.findMany({ take: 1 });
    console.log('Prisma open OK. Sample user:', users);
  } catch (e) {
    console.error('Prisma test failed:', e);
  } finally {
    await p.$disconnect();
  }
})();
