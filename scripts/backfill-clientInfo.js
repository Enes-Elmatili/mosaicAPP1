#!/usr/bin/env node
/*
 * Backfill MaintenanceRequest: migrate optional fields from clientInfo JSON
 * into normalized columns: priority (LOW|MEDIUM|HIGH), categoryId, subcategoryId, photos (Json array).
 * Idempotent: safe to re-run.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
function toEnumPriority(p) {
  if (!p) return null;
  const m = String(p).toLowerCase();
  if (m === 'low') return 'LOW';
  if (m === 'high') return 'HIGH';
  return 'MEDIUM';
}

async function run() {
  const batch = await prisma.maintenanceRequest.findMany({});
  for (const r of batch) {
    let info = null;
    try { info = r.clientInfo ? JSON.parse(r.clientInfo) : null; } catch {}
    if (!info) continue;
    const data = {};
    if (info.categoryId && !r.categoryId) data.categoryId = String(info.categoryId);
    if (info.subcategoryId && !r.subcategoryId) data.subcategoryId = String(info.subcategoryId);
    if (info.priority && !r.priority) data.priority = toEnumPriority(info.priority);
    if (Array.isArray(info.photos) && (!Array.isArray(r.photos) || (r.photos || []).length === 0)) data.photos = info.photos;
    if (Object.keys(data).length > 0) {
      await prisma.maintenanceRequest.update({ where: { id: r.id }, data });
      // console.log('Backfilled', r.id, data);
    }
  }
}

run().then(() => prisma.$disconnect());

