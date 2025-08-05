const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma };
