import { Router } from "express"
import { prisma } from "../db/prisma.js"
import authenticateFlexible from "../middleware/authenticateFlexible.js"
import { z } from "zod"
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js"
import { HttpError } from "../middleware/httpError.js"

const router = Router()

// ───────────────────────────────────────────────
// Schémas Zod
// ───────────────────────────────────────────────
const IdParam = z.object({ id: z.string().uuid() })
const QueryPagination = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
})

const NotificationCreateSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z.enum(["info", "success", "warning", "error"]).default("info"),
})

// ───────────────────────────────────────────────
// POST /api/notifications → créer une notif générique
// ───────────────────────────────────────────────
router.post(
  "/",
  authenticateFlexible,
  validateBody(NotificationCreateSchema),
  async (req, res, next) => {
    try {
      const { userId, title, message, type } = req.body

      const notif = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
        },
      })

      // 🔔 Notifier via socket.io
      req.io?.to(userId).emit("notification:received", notif)

      res.status(201).json({
        code: "NOTIFICATION_CREATED",
        data: notif,
        requestId: req.id,
      })
    } catch (error) {
      next(error)
    }
  }
)

// ───────────────────────────────────────────────
// GET /api/notifications → liste paginée
// ───────────────────────────────────────────────
router.get(
  "/",
  authenticateFlexible,
  validateQuery(QueryPagination),
  async (req, res, next) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new HttpError(401, "UNAUTHENTICATED", "Utilisateur non authentifié")
      }

      const page = req.query.page ?? 1
      const limit = Math.min(req.query.limit ?? 20, 100)
      const skip = (page - 1) * limit

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where: { userId } }),
      ])

      res.json({
        code: "NOTIFICATIONS_LOADED",
        data: notifications,
        meta: { page, limit, total },
        requestId: req.id,
      })
    } catch (error) {
      next(error)
    }
  }
)

// ───────────────────────────────────────────────
// PATCH /api/notifications/:id/read → marquer comme lue
// ───────────────────────────────────────────────
router.patch(
  "/:id/read",
  authenticateFlexible,
  validateParams(IdParam),
  async (req, res, next) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new HttpError(401, "UNAUTHENTICATED", "Utilisateur non authentifié")
      }

      const notification = await prisma.notification.findUnique({
        where: { id: req.params.id },
      })

      if (!notification || notification.userId !== userId) {
        throw new HttpError(404, "NOT_FOUND", "Notification introuvable")
      }

      const updated = await prisma.notification.update({
        where: { id: req.params.id },
        data: { readAt: new Date() },
      })

      res.json({
        code: "NOTIFICATION_READ",
        data: updated,
        requestId: req.id,
      })
    } catch (error) {
      next(error)
    }
  }
)

// ───────────────────────────────────────────────
// DELETE /api/notifications/:id → suppression
// ───────────────────────────────────────────────
router.delete(
  "/:id",
  authenticateFlexible,
  validateParams(IdParam),
  async (req, res, next) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new HttpError(401, "UNAUTHENTICATED", "Utilisateur non authentifié")
      }

      const notif = await prisma.notification.findUnique({
        where: { id: req.params.id },
      })

      if (!notif || notif.userId !== userId) {
        throw new HttpError(404, "NOT_FOUND", "Notification introuvable")
      }

      await prisma.notification.delete({ where: { id: req.params.id } })

      res.json({
        code: "NOTIFICATION_DELETED",
        message: "Notification supprimée",
        requestId: req.id,
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router