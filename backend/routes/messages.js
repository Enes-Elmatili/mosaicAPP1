import { Router } from "express";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { prisma } from "../db/prisma.js";
import { z } from "zod";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";

const router = Router();

// ───────────────────────────────────────────────
// Schemas Zod
// ───────────────────────────────────────────────
const MessageCreateSchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1).max(2000),
});

const RecipientParam = z.object({ recipientId: z.string().uuid() });

const QueryPagination = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ───────────────────────────────────────────────
// POST /api/messages → envoyer un message
// ───────────────────────────────────────────────
router.post(
  "/",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER"),
  validateBody(MessageCreateSchema),
  async (req, res, next) => {
    try {
      const { recipientId, content } = req.body;

      if (recipientId === req.user.id) {
        return res.status(400).json({ error: "You cannot message yourself" });
      }

      const msg = await prisma.message.create({
        data: {
          senderId: req.user.id,
          recipientId,
          content,
        },
      });

      // 🔔 Notifier via socket.io si dispo
      req.io?.to(recipientId).emit("new-message", {
        id: msg.id,
        senderId: msg.senderId,
        recipientId: msg.recipientId,
        content: msg.content,
        createdAt: msg.createdAt,
      });

      res.status(201).json({ success: true, data: msg });
    } catch (e) {
      console.error("[POST /api/messages]", e);
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// GET /api/messages/conversation/:recipientId
// ───────────────────────────────────────────────
router.get(
  "/conversation/:recipientId",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER"),
  validateParams(RecipientParam),
  validateQuery(QueryPagination),
  async (req, res, next) => {
    try {
      const { recipientId } = req.params;
      const page = req.query.page ?? 1;
      const limit = Math.min(req.query.limit ?? 50, 200);
      const skip = (page - 1) * limit;

      const conv = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id, recipientId },
            { senderId: recipientId, recipientId: req.user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      });

      res.json({ success: true, page, limit, data: conv });
    } catch (e) {
      console.error("[GET /api/messages/conversation/:recipientId]", e);
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// GET /api/messages/inbox
// ───────────────────────────────────────────────
router.get(
  "/inbox",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER", "ADMIN"),
  validateQuery(QueryPagination),
  async (req, res, next) => {
    try {
      const page = req.query.page ?? 1;
      const limit = Math.min(req.query.limit ?? 20, 100);
      const skip = (page - 1) * limit;

      const inbox = await prisma.message.findMany({
        where: { recipientId: req.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      });

      res.json({ success: true, page, limit, data: inbox });
    } catch (e) {
      console.error("[GET /api/messages/inbox]", e);
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// GET /api/messages/unread → compteur non lus
// ───────────────────────────────────────────────
router.get(
  "/unread",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER", "ADMIN"),
  async (req, res, next) => {
    try {
      const count = await prisma.message.count({
        where: {
          recipientId: req.user.id,
          readAt: null,
        },
      });

      res.json({ success: true, unread: count });
    } catch (e) {
      console.error("[GET /api/messages/unread]", e);
      next(e);
    }
  }
);

// ───────────────────────────────────────────────
// PATCH /api/messages/:id/read → marquer comme lu
// ───────────────────────────────────────────────
router.patch(
  "/:id/read",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER", "ADMIN"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const message = await prisma.message.findUnique({ where: { id } });
      if (!message || message.recipientId !== req.user.id) {
        return res.status(404).json({ error: "Message not found" });
      }

      const updated = await prisma.message.update({
        where: { id },
        data: { readAt: new Date() },
      });

      res.json({ success: true, data: updated });
    } catch (e) {
      console.error("[PATCH /api/messages/:id/read]", e);
      next(e);
    }
  }
);

export default router;
