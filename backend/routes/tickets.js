// backend/routes/tickets.js
import express from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { HttpError } from "../middleware/httpError.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { validateBody, validateParams } from "../middleware/validate.js";

const router = express.Router();

// ───────────────────────────────────────────────
// Schémas Zod
// ───────────────────────────────────────────────
const TicketIdSchema = z.object({
  id: z.string().uuid(),
});

const TicketCreateSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).default("OPEN"),
});

const TicketUpdateSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]).optional(),
});

// ───────────────────────────────────────────────
// Middleware d’auth
// ───────────────────────────────────────────────
router.use(authenticateFlexible);

/**
 * GET /tickets
 * - CLIENT → ses tickets
 * - ADMIN → tous les tickets
 */
router.get("/", async (req, res, next) => {
  try {
    const where = req.user.role === "ADMIN" ? {} : { userId: req.user.id };

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error("[GET /tickets]", error);
    next(error);
  }
});

/**
 * GET /tickets/:id
 * - CLIENT → seulement ses tickets
 * - ADMIN → peut voir tous
 */
router.get("/:id", validateParams(TicketIdSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const where =
      req.user.role === "ADMIN"
        ? { id }
        : { id, userId: req.user.id };

    const ticket = await prisma.ticket.findFirst({ where });

    if (!ticket) throw HttpError.notFound("Ticket not found");

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error("[GET /tickets/:id]", error);
    next(error);
  }
});

/**
 * POST /tickets
 * - CLIENT uniquement
 */
router.post(
  "/",
  requireRole("CLIENT"),
  validateBody(TicketCreateSchema),
  async (req, res, next) => {
    try {
      const { title, description, priority, status } = req.body;

      const newTicket = await prisma.ticket.create({
        data: {
          userId: req.user.id,
          title,
          description,
          priority,
          status,
        },
      });

      res.status(201).json({ success: true, data: newTicket });
    } catch (error) {
      console.error("[POST /tickets]", error);
      next(error);
    }
  }
);

/**
 * PATCH /tickets/:id
 * - CLIENT → seulement ses tickets
 * - ADMIN → peut modifier n’importe quel ticket
 */
router.patch(
  "/:id",
  validateParams(TicketIdSchema),
  validateBody(TicketUpdateSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const where =
        req.user.role === "ADMIN"
          ? { id }
          : { id, userId: req.user.id };

      const updatedTicket = await prisma.ticket.update({
        where,
        data: req.body,
      });

      res.json({ success: true, data: updatedTicket });
    } catch (error) {
      console.error("[PATCH /tickets/:id]", error);
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Ticket not found" });
      }
      next(error);
    }
  }
);

/**
 * DELETE /tickets/:id
 * - CLIENT → supprime uniquement ses tickets
 * - ADMIN → supprime tout
 */
router.delete("/:id", validateParams(TicketIdSchema), async (req, res, next) => {
  try {
    const { id } = req.params;

    const where =
      req.user.role === "ADMIN"
        ? { id }
        : { id, userId: req.user.id };

    const ticket = await prisma.ticket.findFirst({ where });
    if (!ticket) throw HttpError.notFound("Ticket not found");

    await prisma.ticket.delete({ where: { id } });

    res.status(204).end();
  } catch (error) {
    console.error("[DELETE /tickets/:id]", error);
    next(error);
  }
});

export default router;
