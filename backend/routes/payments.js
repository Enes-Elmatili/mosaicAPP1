import express from "express"
import { z } from "zod"
import { prisma } from "../db/prisma.js"
import { HttpError } from "../middleware/httpError.js"
import authenticateFlexible from "../middleware/authenticateFlexible.js"
import { requireRole } from "../middleware/requireRole.js"
import { validateBody, validateParams } from "../middleware/validate.js"

const router = express.Router()

// ───────────────────────────────────────────────
// Schemas Zod
// ───────────────────────────────────────────────
const PaymentIdSchema = z.object({
  id: z.string().min(10), // cuid() ou uuid()
})

const PaymentCreateSchema = z.object({
  providerId: z.string().min(10),
  amount: z.number().positive(),
  currency: z.string().default("MAD"),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
})

const PaymentUpdateSchema = z.object({
  providerId: z.string().min(10).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
})

// ───────────────────────────────────────────────
// GET /api/payments (admin)
// ───────────────────────────────────────────────
router.get(
  "/",
  authenticateFlexible,
  requireRole("ADMIN", "PROVIDER"),
  async (req, res, next) => {
    try {
      const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1)
      const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '20'), 10) || 20, 1), 100)
      const skip = (page - 1) * limit

      let where = undefined
      if ((req.user?.roles || []).includes("PROVIDER")) {
        const provider = await prisma.provider.findFirst({ where: { userId: req.user.id }, select: { id: true } })
        where = provider ? { providerId: provider.id } : { providerId: "__none__" }
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
        prisma.payment.count({ where }),
      ])

      // Enrich with client info + invoice url (best-effort)
      const enriched = await Promise.all(
        payments.map(async (p) => {
          try {
            const reqRow = await prisma.request.findFirst({
              where: { providerId: p.providerId, status: "DONE", createdAt: { lte: p.createdAt } },
              orderBy: { createdAt: "desc" },
              select: { id: true, client: { select: { id: true, email: true } } },
            })
            let invoiceUrl = null
            if (reqRow) {
              const inv = await prisma.invoice.findFirst({ where: { requestId: reqRow.id }, select: { id: true } })
              if (inv) invoiceUrl = `/api/admin/invoices/${inv.id}/pdf`
            }
            return {
              ...p,
              clientId: reqRow?.client?.id ?? null,
              clientEmail: reqRow?.client?.email ?? null,
              requestId: reqRow?.id ?? null,
              invoiceUrl,
            }
          } catch {
            return { ...p, clientId: null, clientEmail: null, requestId: null, invoiceUrl: null }
          }
        })
      )

      res.json({
        code: "PAYMENTS_LIST",
        data: enriched,
        page,
        limit,
        total,
        requestId: req.id,
      })
    } catch (err) {
      next(HttpError.internal("Failed to fetch payments", { cause: err }))
    }
  }
)

// ───────────────────────────────────────────────
// GET /api/payments/:id
// ───────────────────────────────────────────────
router.get(
  "/:id",
  authenticateFlexible,
  validateParams(PaymentIdSchema),
  async (req, res, next) => {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: req.params.id },
      })

      if (!payment) throw HttpError.notFound("Payment not found")

      res.json({
        code: "PAYMENT_DETAIL",
        data: payment,
        requestId: req.id,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ───────────────────────────────────────────────
// POST /api/payments → créer un paiement
// ───────────────────────────────────────────────
router.post(
  "/",
  authenticateFlexible,
  requireRole("PROVIDER", "ADMIN"),
  validateBody(PaymentCreateSchema),
  async (req, res, next) => {
    try {
      const { providerId, amount, currency, status } = req.body

      const newPayment = await prisma.payment.create({
        data: {
          providerId,
          amount,
          currency,
          status,
          createdAt: new Date(),
        },
      })

      // 🔔 Notifier en temps réel
      req.io?.emit("payment:created", newPayment)

      // 🔔 Mettre à jour les earnings du provider
      try {
        const provider = await prisma.provider.findUnique({ where: { id: providerId }, select: { userId: true } })
        if (provider?.userId) {
          const startOfMonth = new Date();
          startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
          const monthPayments = await prisma.payment.findMany({
            where: { providerId, status: "completed", createdAt: { gte: startOfMonth } },
            select: { amount: true },
          })
          const monthTotal = monthPayments.reduce((s,p)=> s + (p.amount||0), 0)
          req.io?.to(provider.userId).emit("earnings_update", { monthTotal })
        }
      } catch {}

      res.status(201).json({
        code: "PAYMENT_CREATED",
        data: newPayment,
        requestId: req.id,
      })
    } catch (err) {
      if (err.code === "P2003") {
        return next(HttpError.badRequest("Invalid providerId: provider not found"))
      }
      next(err)
    }
  }
)

// ───────────────────────────────────────────────
// PUT /api/payments/:id → update
// ───────────────────────────────────────────────
router.put(
  "/:id",
  authenticateFlexible,
  requireRole("ADMIN"),
  validateParams(PaymentIdSchema),
  validateBody(PaymentUpdateSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params

      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: req.body,
      })

      req.io?.emit("payment:updated", updatedPayment)

      // 🔔 Si passage à completed, rafraîchir earnings
      try {
        if (updatedPayment.status === "completed") {
          const provider = await prisma.provider.findUnique({ where: { id: updatedPayment.providerId }, select: { userId: true } })
          if (provider?.userId) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
            const monthPayments = await prisma.payment.findMany({
              where: { providerId: updatedPayment.providerId, status: "completed", createdAt: { gte: startOfMonth } },
              select: { amount: true },
            })
            const monthTotal = monthPayments.reduce((s,p)=> s + (p.amount||0), 0)
            req.io?.to(provider.userId).emit("earnings_update", { monthTotal })
          }
        }
      } catch {}

      res.json({
        code: "PAYMENT_UPDATED",
        data: updatedPayment,
        requestId: req.id,
      })
    } catch (err) {
      if (err.code === "P2025") return next(HttpError.notFound("Payment not found"))
      if (err.code === "P2003") return next(HttpError.badRequest("Invalid providerId: provider not found"))
      next(err)
    }
  }
)

// ───────────────────────────────────────────────
// DELETE /api/payments/:id
// ───────────────────────────────────────────────
router.delete(
  "/:id",
  authenticateFlexible,
  requireRole("ADMIN"),
  validateParams(PaymentIdSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params

      await prisma.payment.delete({
        where: { id },
      })

      req.io?.emit("payment:deleted", { id })

      res.json({
        code: "PAYMENT_DELETED",
        message: "Payment deleted",
        requestId: req.id,
      })
    } catch (err) {
      if (err.code === "P2025") return next(HttpError.notFound("Payment not found"))
      next(err)
    }
  }
)

export default router
