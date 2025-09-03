// backend/routes/payments.js
import express from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import HttpError from "../middleware/httpError.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { validateBody, validateParams } from "../middleware/validate.js";

const router = express.Router();

// --- Validation Schemas ---
const PaymentIdSchema = z.object({
  id: z.string().min(10), // ✅ patch : accepte cuid() ou uuid()
});

// ✅ adapté à ton schema Prisma + patch UUID/cuid
const PaymentCreateSchema = z.object({
  providerId: z.string().min(10), // ✅ accepte cuid() ou uuid
  amount: z.number().positive(),
  currency: z.string().default("MAD"),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
});

// ✅ idem pour update
const PaymentUpdateSchema = z.object({
  providerId: z.string().min(10).optional(), // ✅ accepte cuid() ou uuid
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]).optional(),
});

// --- ROUTES ---

/**
 * GET /payments
 * Récupérer tous les paiements (admin)
 */
router.get("/", authenticateFlexible, async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(payments);
  } catch (err) {
    next(HttpError.internal("Failed to fetch payments", { cause: err }));
  }
});

/**
 * GET /payments/:id
 * Récupérer un paiement par ID
 */
router.get("/:id", authenticateFlexible, validateParams(PaymentIdSchema), async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
    });

    if (!payment) throw HttpError.notFound("Payment not found");

    res.json(payment);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /payments
 * Créer un nouveau paiement
 */
router.post("/", authenticateFlexible, validateBody(PaymentCreateSchema), async (req, res, next) => {
  try {
    const { providerId, amount, currency, status } = req.body;

    const newPayment = await prisma.payment.create({
      data: {
        providerId,
        amount,
        currency,
        status,
        createdAt: new Date(),
      },
    });

    res.status(201).json(newPayment);
  } catch (err) {
    // 🔹 Prisma : violation de clé étrangère (providerId invalide)
    if (err.code === "P2003") {
      return next(HttpError.badRequest("Invalid providerId: provider not found"));
    }
    next(err);
  }
});

/**
 * PUT /payments/:id
 * Mettre à jour un paiement
 */
router.put(
  "/:id",
  authenticateFlexible,
  validateParams(PaymentIdSchema),
  validateBody(PaymentUpdateSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: req.body,
      });

      res.json(updatedPayment);
    } catch (err) {
      if (err.code === "P2025") return next(HttpError.notFound("Payment not found"));
      if (err.code === "P2003") return next(HttpError.badRequest("Invalid providerId: provider not found"));
      next(err);
    }
  }
);

/**
 * DELETE /payments/:id
 * Supprimer un paiement
 */
router.delete("/:id", authenticateFlexible, validateParams(PaymentIdSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.payment.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") return next(HttpError.notFound("Payment not found"));
    next(err);
  }
});

export default router;
