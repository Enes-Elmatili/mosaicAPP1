import { Router } from "express"
import authenticateFlexible from "../middleware/authenticateFlexible.js"
import { requireRole } from "../middleware/requireRole.js"
import { prisma } from "../db/prisma.js"
import { z } from "zod"
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js"
import { HttpError } from "../middleware/httpError.js"

const router = Router()

// ───────────────────────────────────────────────
// Schemas Zod
// ───────────────────────────────────────────────
const MessageCreateSchema = z.object({
  // Keep recipientId from frontend payload, map to DB field `to`
  recipientId: z.string().min(1),
  content: z.string().min(1).max(2000),
})

// IDs are cuid() in schema, so don't force UUID
const RecipientParam = z.object({ recipientId: z.string().min(1) })

const QueryPagination = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
})

// Utility to normalize a DB message to frontend shape
function toDto(msg) {
  return {
    id: msg.id,
    senderId: msg.from,
    recipientId: msg.to,
    text: msg.content,
    createdAt: msg.createdAt,
    readAt: msg.readAt ?? null, // schema may not have readAt; default to null
  }
}

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
      const { recipientId, content } = req.body

      if (recipientId === req.user.id) {
        throw new HttpError(400, "INVALID_RECIPIENT", "Impossible de vous envoyer un message à vous-même")
      }

      const msg = await prisma.message.create({
        data: {
          from: req.user.id,
          to: recipientId,
          content,
        },
      })

      // 🔔 Notifier via socket.io
      req.io?.to(recipientId).emit("message:received", toDto(msg))

      res.status(201).json({
        code: "MESSAGE_SENT",
        message: "Message envoyé avec succès",
        data: toDto(msg),
        requestId: req.id,
      })
    } catch (e) {
      next(e)
    }
  }
)

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
      const { recipientId } = req.params
      const page = req.query.page ?? 1
      const limit = Math.min(req.query.limit ?? 50, 200)
      const skip = (page - 1) * limit

      // Vérif: l’utilisateur doit être partie prenante
      const conv = await prisma.message.findMany({
        where: {
          OR: [
            { from: req.user.id, to: recipientId },
            { from: recipientId, to: req.user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      })

      const total = await prisma.message.count({
        where: {
          OR: [
            { from: req.user.id, to: recipientId },
            { from: recipientId, to: req.user.id },
          ],
        },
      })

      res.json({
        code: "CONVERSATION_LOADED",
        data: conv.map(toDto),
        meta: { page, limit, total },
        requestId: req.id,
      })
    } catch (e) {
      next(e)
    }
  }
)

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
      const page = req.query.page ?? 1
      const limit = Math.min(req.query.limit ?? 20, 100)
      const skip = (page - 1) * limit

      const inbox = await prisma.message.findMany({
        where: { to: req.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      })

      const total = await prisma.message.count({
        where: { to: req.user.id },
      })

      res.json({
        code: "INBOX_LOADED",
        data: inbox.map(toDto),
        meta: { page, limit, total },
        requestId: req.id,
      })
    } catch (e) {
      next(e)
    }
  }
)

// ───────────────────────────────────────────────
// GET /api/messages/unread
// ───────────────────────────────────────────────
router.get(
  "/unread",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER", "ADMIN"),
  async (req, res, next) => {
    try {
      // Schema doesn't track read state → return 0 for now
      res.json({ code: "UNREAD_COUNT", unread: 0, requestId: req.id })
    } catch (e) {
      next(e)
    }
  }
)

// ───────────────────────────────────────────────
// PATCH /api/messages/:id/read
// ───────────────────────────────────────────────
router.patch(
  "/:id/read",
  authenticateFlexible,
  requireRole("CLIENT", "PROVIDER", "ADMIN"),
  async (req, res, next) => {
    try {
      const { id } = req.params
      const message = await prisma.message.findUnique({ where: { id } })
      if (!message || message.to !== req.user.id) {
        throw new HttpError(404, "NOT_FOUND", "Message introuvable")
      }
      // No readAt in schema → return current message as-is
      res.json({ code: "MESSAGE_READ", data: toDto(message), requestId: req.id })
    } catch (e) {
      next(e)
    }
  }
)

export default router
