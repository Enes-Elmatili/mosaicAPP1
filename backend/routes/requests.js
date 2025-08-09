const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const { HttpError } = require('../middleware/httpError');
const { authenticateFlexible } = require('../middleware/authenticate');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { validateMimeAndSize } = require('../services/utils');
const sizeOf = require('image-size');
const multer = require('multer');

const router = express.Router();

// Controllers for maintenance requests and status management
const { createRequest } = require('../controllers/requestsController');
const { updateStatus, getStatusHistory } = require('../controllers/statusController');
const { exportStatusHistoryPdf, exportStatusHistoryCsv } = require('../controllers/statusExportController');
router.use(authenticateFlexible);

// Rate limit: max requests per hour per user
const createRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_HOUR) || 5,
  keyGenerator: req => req.userId,
  handler: (_req, res) => res.status(429).json({ error: 'error.rate_limit_exceeded' }),
});

// File upload setup
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: (parseInt(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024 } });

// Schemas for MaintenanceRequest
const ServiceType = z.enum(['plumbing', 'electrical', 'hvac', 'general', 'other']);
const Priority = z.enum(['low', 'medium', 'high']);
const createRequestSchema = z.object({
  propertyId: z.union([z.string(), z.number()]).transform((v) => String(v)),
  serviceType: ServiceType,
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  description: z.string().min(1),
  photos: z.array(z.string().url()).optional(),
  priority: Priority.optional(),
});
const updateRequestSchema = z.object({
  propertyId: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
  serviceType: ServiceType.optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  description: z.string().min(1).optional(),
  photos: z.array(z.string().url()).optional(),
  priority: Priority.optional(),
  status: z.string().optional(),
});

// Helpers: backward compatibility for legacy clientInfo JSON (read-only)
function unpackClientInfo(clientInfo) {
  try { return clientInfo ? JSON.parse(clientInfo) : {}; } catch { return {}; }
}
const toEnumPriority = (p) => (p ? String(p).toLowerCase() === 'high' ? 'HIGH' : String(p).toLowerCase() === 'low' ? 'LOW' : 'MEDIUM' : undefined);

/**
 * POST /requests - create a maintenance service request
 */
router.post('/', createRequestLimiter, async (req, res, next) => {
  try {
    const { prisma } = require('../db/prisma');
    const parsed = createRequestSchema.parse(req.body);
    const record = await prisma.maintenanceRequest.create({
      data: {
        clientId: req.userId,
        propertyId: parsed.propertyId,
        serviceType: parsed.serviceType,
        description: parsed.description,
        priority: toEnumPriority(parsed.priority),
        categoryId: parsed.categoryId,
        subcategoryId: parsed.subcategoryId,
        photos: parsed.photos || [],
        urgent: false,
        providerId: 'provider_tbd',
        providerName: 'TBD',
        providerDistanceKm: 0,
        contractUrl: '',
      },
    });
    // Merge any legacy values from clientInfo if present (read-only)
    const extras = unpackClientInfo(record.clientInfo);
    const out = {
      ...record,
      priority: record.priority || (extras.priority && toEnumPriority(extras.priority)),
      categoryId: record.categoryId || extras.categoryId,
      subcategoryId: record.subcategoryId || extras.subcategoryId,
      photos: (record.photos && Array.isArray(record.photos) ? record.photos : (extras.photos || [])),
    };
    res.status(201).json(out);
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: 'validation_error', details: err.issues });
    next(err);
  }
});

// GET /api/requests - list requests for client
/**
 * GET /requests - list or filter maintenance requests by status
 * Query param: status (optional)
 */
router.get('/', async (req, res, next) => {
  try {
    const { prisma } = require('../db/prisma');
    const filter = { clientId: req.userId };
    if (req.query.status) filter.status = String(req.query.status);
    if (req.query.propertyId) filter.propertyId = String(req.query.propertyId);
    if (req.query.serviceType) filter.serviceType = String(req.query.serviceType);
    // Pagination & sorting
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 50);
    const sortBy = ['createdAt', 'updatedAt', 'status'].includes(String(req.query.sortBy)) ? String(req.query.sortBy) : 'createdAt';
    const order = String(req.query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const total = await prisma.maintenanceRequest.count({ where: filter });
    const requests = await prisma.maintenanceRequest.findMany({
      where: filter,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const items = requests.map((r) => {
      const extras = unpackClientInfo(r.clientInfo);
      return {
        ...r,
        priority: r.priority || (extras.priority && toEnumPriority(extras.priority)),
        categoryId: r.categoryId || extras.categoryId,
        subcategoryId: r.subcategoryId || extras.subcategoryId,
        photos: (r.photos && Array.isArray(r.photos) ? r.photos : (extras.photos || [])),
      };
    });
    res.json({ items, total, page, pageSize });
  } catch (err) {
    next(err);
  }
});

// GET /api/requests/:id - get request details for client
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { prisma } = require('../db/prisma');
    const request = await prisma.maintenanceRequest.findFirst({
      where: { id, clientId: req.userId },
    });
    if (!request) throw new HttpError(404, 'Request not found');
    const extras = unpackClientInfo(request.clientInfo);
    res.json({
      ...request,
      priority: request.priority || (extras.priority && toEnumPriority(extras.priority)),
      categoryId: request.categoryId || extras.categoryId,
      subcategoryId: request.subcategoryId || extras.subcategoryId,
      photos: (request.photos && Array.isArray(request.photos) ? request.photos : (extras.photos || [])),
    });
  } catch (err) {
    next(err);
  }
});

// POST /requests/:id/status - update request status and log history
const { requireStatusAuth } = require('../middleware/authorizeStatusChange');
router.post('/:id/status', requireStatusAuth, updateStatus);

// PATCH /requests/:id - partial update (description, serviceType, etc.)
router.patch('/:id', async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { prisma } = require('../db/prisma');
    const existing = await prisma.maintenanceRequest.findFirst({ where: { id: requestId, clientId: req.userId } });
    if (!existing) throw new HttpError(404, 'Request not found');
    const parsed = updateRequestSchema.parse(req.body);
    const prev = unpackClientInfo(existing.clientInfo);
    const data = {};
    if (parsed.propertyId !== undefined) data.propertyId = parsed.propertyId;
    if (parsed.serviceType !== undefined) data.serviceType = parsed.serviceType;
    if (parsed.description !== undefined) data.description = parsed.description;
    if (parsed.status !== undefined) data.status = parsed.status;
    if (parsed.priority !== undefined) data.priority = toEnumPriority(parsed.priority);
    if (parsed.categoryId !== undefined) data.categoryId = parsed.categoryId;
    if (parsed.subcategoryId !== undefined) data.subcategoryId = parsed.subcategoryId;
    if (parsed.photos !== undefined) data.photos = parsed.photos;
    const updated = await prisma.maintenanceRequest.update({ where: { id: requestId }, data });
    const extras = unpackClientInfo(updated.clientInfo);
    res.json({
      ...updated,
      priority: updated.priority || (extras.priority && toEnumPriority(extras.priority)),
      categoryId: updated.categoryId || extras.categoryId,
      subcategoryId: updated.subcategoryId || extras.subcategoryId,
      photos: (updated.photos && Array.isArray(updated.photos) ? updated.photos : (extras.photos || [])),
    });
  } catch (err) {
    if (err?.issues) return res.status(400).json({ error: 'validation_error', details: err.issues });
    next(err);
  }
});

// DELETE /requests/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { prisma } = require('../db/prisma');
    const existing = await prisma.maintenanceRequest.findFirst({ where: { id, clientId: req.userId } });
    if (!existing) throw new HttpError(404, 'Request not found');
    await prisma.maintenanceRequest.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * GET /requests/:id/status-history - get status change history
 */
router.get('/:id/status-history', getStatusHistory);

/**
 * GET /requests/:id/status-history/export/pdf - download status history as PDF
 */
router.get('/:id/status-history/export/pdf', exportStatusHistoryPdf);

/**
 * GET /requests/:id/status-history/export/csv - download status history as CSV
 */
router.get('/:id/status-history/export/csv', exportStatusHistoryCsv);
// POST /api/requests/:id/photos - upload photo for a request
router.post('/:id/photos', upload.single('file'), async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id);
    const { prisma } = require('../db/prisma');
    const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
    if (!request || request.clientId !== req.userId) {
      throw new HttpError(403, 'error.forbidden');
    }
    const file = req.file;
    if (!file) throw new HttpError(400, 'error.no_file');
    validateMimeAndSize(file);
    const uploadDir = process.env.LOCAL_UPLOAD_DIR || 'uploads';
    const ext = file.mimetype === 'image/png' ? 'png' : 'jpg';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const dir = path.join(process.cwd(), uploadDir, 'requests', String(requestId));
    await fs.mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    await fs.writeFile(filepath, file.buffer);
    const dimensions = sizeOf(file.buffer);
    const url = `/uploads/requests/${requestId}/${filename}`;
    // Append to clientInfo.photos
    const photos = Array.isArray(request.photos) ? request.photos.slice() : [];
    photos.push(url);
    await prisma.maintenanceRequest.update({ where: { id: requestId }, data: { photos } });
    console.log('Photo uploaded', { userId: req.userId, requestId, size: file.size, ip: req.ip });
    res.status(201).json({ url, width: dimensions.width, height: dimensions.height, size: file.size, mime: file.mimetype });
  } catch (err) {
    if (err.status && err.message) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

// DELETE /api/requests/:id/photos/:filename - remove a photo
router.delete('/:id/photos/:filename', async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id);
    const fileParam = req.params.filename;
    const { prisma } = require('../db/prisma');
    const request = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
    if (!request || request.clientId !== req.userId) throw new HttpError(403, 'error.forbidden');
    const uploadDir = process.env.LOCAL_UPLOAD_DIR || 'uploads';
    const rel = path.join('requests', String(requestId), fileParam);
    const filepath = path.join(process.cwd(), uploadDir, rel);
    await fs.unlink(filepath).catch(() => {});
    const extras = unpackClientInfo(request.clientInfo);
    const photos = (Array.isArray(extras.photos) ? extras.photos : []).filter((u) => !u.endsWith('/' + fileParam));
    const newInfo = packClientInfo({ ...extras, photos });
    await prisma.maintenanceRequest.update({ where: { id: requestId }, data: { clientInfo: newInfo } });
    res.status(204).end();
  } catch (err) {
    if (err.status && err.message) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;
