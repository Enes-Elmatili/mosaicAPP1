// backend/routes/contracts.js
import express from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody, validateParams } from "../middleware/validate.js";

import paymentsRouter from "./payments.js";

const router = express.Router();

// ───────────────────────────────────────────────
// Schemas Zod
// ───────────────────────────────────────────────
const ContractBody = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

const ContractUpdate = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
});

const IdParam = z.object({ id: z.string().cuid() });

// Middleware global : authentification obligatoire
router.use(authenticateFlexible);

// ───────────────────────────────────────────────
// GET /contracts → liste des contrats de l’utilisateur
// ───────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const contracts = await prisma.contract.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: contracts });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// GET /contracts/:id → détail d’un contrat
// ───────────────────────────────────────────────
router.get("/:id", validateParams(IdParam), async (req, res, next) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
    });
    if (!contract || contract.userId !== req.user.id) {
      return res.status(404).json({ error: "Contract not found" });
    }
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// POST /contracts → créer un contrat
// ───────────────────────────────────────────────
router.post("/", validateBody(ContractBody), async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const contract = await prisma.contract.create({
      data: { title, content, userId: req.user.id },
    });
    res.status(201).json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// PATCH /contracts/:id → mise à jour
// ───────────────────────────────────────────────
router.patch(
  "/:id",
  validateParams(IdParam),
  validateBody(ContractUpdate),
  async (req, res, next) => {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: req.params.id },
      });
      if (!contract || contract.userId !== req.user.id) {
        return res.status(404).json({ error: "Contract not found" });
      }

      const updated = await prisma.contract.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// ───────────────────────────────────────────────
// DELETE /contracts/:id → suppression
// ───────────────────────────────────────────────
router.delete("/:id", validateParams(IdParam), async (req, res, next) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
    });
    if (!contract || contract.userId !== req.user.id) {
      return res.status(404).json({ error: "Contract not found" });
    }

    await prisma.contract.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Contract deleted" });
  } catch (err) {
    next(err);
  }
});

// ✅ Sous-router paiements
router.use("/payments", requireRole("ADMIN", "CLIENT"), paymentsRouter);

export default router;
