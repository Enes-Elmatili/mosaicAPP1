// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const authenticateFlexible = require('../middleware/authenticateFlexible');

let prisma = null;
try {
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (e) {
  console.warn('[admin] Prisma indisponible (dev/mocks utilisés):', e?.message || e);
}

function nowISO() { return new Date().toISOString(); }
function mockOverview() {
  return {
    metrics: { totalRequests: 12, openRequests: 4, usersCount: 27, providersCount: 5 },
    latestRequests: [
      { id: 101, propertyId: 'APT-001', serviceType: 'plumbing',   status: 'OPEN',        createdAt: nowISO() },
      { id: 100, propertyId: 'APT-014', serviceType: 'electrical', status: 'IN_PROGRESS', createdAt: nowISO() },
    ],
    latestUsers: [
      { id: 'u42', email: 'new@demo', role: 'tenant',   createdAt: nowISO() },
      { id: 'u41', email: 'pro@demo', role: 'provider', createdAt: nowISO() },
    ],
  };
}

router.get('/overview', authenticateFlexible, async (req, res) => {
  const role = (req.user?.role || '').toLowerCase();
  if (role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  // Si Prisma n'est pas dispo → mock direct
  if (!prisma) return res.json(mockOverview());

  try {
    // NOTE: adapte ces noms à TON schema.prisma si besoin
    // Par ex. si ton modèle s'appelle MaintenanceRequest, c'est prisma.maintenanceRequest
    const mr = prisma.maintenanceRequest || prisma.MaintenanceRequest; // tolérant
    const usr = prisma.user || prisma.User;

    const [
      totalRequests,
      openRequests,
      usersCount,
      providersCount,
      latestRequests,
      latestUsers,
    ] = await Promise.all([
      mr?.count() ?? 0,
      mr?.count({ where: { status: 'OPEN' } }) ?? 0,
      usr?.count() ?? 0,
      usr?.count({ where: { role: 'provider' } }) ?? 0,
      mr?.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, propertyId: true, serviceType: true, status: true, createdAt: true },
      }) ?? [],
      usr?.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, email: true, role: true, createdAt: true },
      }) ?? [],
    ]);

    return res.json({
      metrics: { totalRequests, openRequests, usersCount, providersCount },
      latestRequests,
      latestUsers,
    });
  } catch (err) {
    console.error('[admin/overview] Prisma error:', err);
    // fallback mock pour ne pas casser le dashboard
    return res.json(mockOverview());
  }
});

module.exports = router;
