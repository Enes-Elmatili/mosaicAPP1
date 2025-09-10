// backend/routes/admin.js
import { Router } from "express";
import { prisma } from "../db/prisma.js";
import authenticateStrict from "../middleware/authenticateStrict.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";
import { z } from "zod";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import { debit } from "../services/walletService.js";

const router = Router();

// ───────────────────────────────────────────────
// Schémas Zod
// ───────────────────────────────────────────────
const QueryPagination = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

const UserIdParam = z.object({ id: z.string().uuid() });

const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6), // ⚠️ à hasher dans ton service
  role: z.enum(["ADMIN", "CLIENT", "PROVIDER"]),
});

const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "CLIENT", "PROVIDER"]).optional(),
  isActive: z.boolean().optional(),
});

const SubscriptionCreateSchema = z.object({
  userId: z.string().uuid(),
  plan: z.string(),
  price: z.number().positive(),
  currency: z.string().default("MAD"),
  status: z.enum(["ACTIVE", "CANCELLED"]).default("ACTIVE"),
});

// ───────────────────────────────────────────────
// Withdraws (approbation)
// ───────────────────────────────────────────────
const WithdrawQuery = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});
const WithdrawIdParam = z.object({ id: z.string().cuid() });

// ───────────────────────────────────────────────
// 🔐 Auth global : souple en DEV, strict en PROD
// ───────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  router.use(authenticateStrict, requireRole("ADMIN"));
} else {
  router.use(authenticateFlexible, requireRole("ADMIN"));
}

// ───────────────────────────────────────────────
// Dashboard
// ───────────────────────────────────────────────
router.get("/overview", async (req, res, next) => {
  try {
    const [totalRequests, openRequests, usersCount, providersCount] =
      await Promise.all([
        prisma.request.count(),
        prisma.request.count({ where: { status: "PUBLISHED" } }), // ⚠️ enum corrigé
        prisma.user.count(),
        prisma.user.count({
          where: { userRoles: { some: { role: { name: "PROVIDER" } } } },
        }),
      ]);

    const latestRequests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        propertyId: true,
        serviceType: true,
        status: true,
        createdAt: true,
      },
    });

    const latestUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        email: true,
        createdAt: true,
        userRoles: { include: { role: true } },
      },
    });

    res.json({
      success: true,
      metrics: { totalRequests, openRequests, usersCount, providersCount },
      latestRequests,
      latestUsers: latestUsers.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.userRoles[0]?.role?.name || "UNKNOWN",
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    console.error("[GET /admin/overview]", err);
    next(err);
  }
});

// ───────────────────────────────────────────────
// Users CRUD
// ───────────────────────────────────────────────
router.get("/users", validateQuery(QueryPagination), async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;
    const limit = Math.min(req.query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { userRoles: { include: { role: true } } },
      }),
      prisma.user.count(),
    ]);

    res.json({ success: true, page, limit, total, data: users });
  } catch (err) {
    console.error("[GET /admin/users]", err);
    next(err);
  }
});

router.post("/users", validateBody(UserCreateSchema), async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await prisma.user.create({
      data: {
        email,
        password, // ⚠️ à hasher avant prod
        userRoles: {
          create: { role: { connect: { name: role } } },
        },
      },
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    console.error("[POST /admin/users]", err);
    next(err);
  }
});

router.patch(
  "/users/:id",
  validateParams(UserIdParam),
  validateBody(UserUpdateSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await prisma.user.update({
        where: { id },
        data: req.body,
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      console.error("[PATCH /admin/users/:id]", err);
      next(err);
    }
  }
);

router.delete("/users/:id", validateParams(UserIdParam), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error("[DELETE /admin/users/:id]", err);
    next(err);
  }
});

// ───────────────────────────────────────────────
// Requests
// ───────────────────────────────────────────────
router.get("/requests", validateQuery(QueryPagination), async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;
    const limit = Math.min(req.query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { property: true, user: true },
      }),
      prisma.request.count(),
    ]);

    res.json({ success: true, page, limit, total, data: requests });
  } catch (err) {
    console.error("[GET /admin/requests]", err);
    next(err);
  }
});

// ───────────────────────────────────────────────
// Providers
// ───────────────────────────────────────────────
router.get("/providers", validateQuery(QueryPagination), async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;
    const limit = Math.min(req.query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [providers, total] = await Promise.all([
      prisma.user.findMany({
        where: { userRoles: { some: { role: { name: "PROVIDER" } } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { userRoles: { include: { role: true } } },
      }),
      prisma.user.count({
        where: { userRoles: { some: { role: { name: "PROVIDER" } } } },
      }),
    ]);

    res.json({ success: true, page, limit, total, data: providers });
  } catch (err) {
    console.error("[GET /admin/providers]", err);
    next(err);
  }
});

// ───────────────────────────────────────────────
// Subscriptions
// ───────────────────────────────────────────────
router.post("/subscriptions", validateBody(SubscriptionCreateSchema), async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.create({
      data: req.body,
    });
    res.status(201).json({ success: true, data: subscription });
  } catch (err) {
    console.error("[POST /admin/subscriptions]", err);
    next(err);
  }
});

// ───────────────────────────────────────────────
// Files
// ───────────────────────────────────────────────
router.get("/files", async (req, res, next) => {
  try {
    if (!prisma?.file?.findMany) {
      return res.json({ success: true, data: [] });
    }
    const files = await prisma.file.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ success: true, data: files });
  } catch (err) {
    console.error("[GET /admin/files]", err);
    next(err);
  }
});

// ───────────────────────────────────────────────
// Withdraws list
// ───────────────────────────────────────────────
router.get("/withdraws", validateQuery(WithdrawQuery), async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;
    const limit = Math.min(req.query.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const where = req.query.status ? { status: req.query.status } : {};

    const [items, total] = await Promise.all([
      prisma.withdrawRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      prisma.withdrawRequest.count({ where }),
    ]);

    res.json({ success: true, page, limit, total, data: items });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// Withdraw approve
// ───────────────────────────────────────────────
router.patch("/withdraws/:id/approve", validateParams(WithdrawIdParam), async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const wr = await prisma.withdrawRequest.findUnique({ where: { id: req.params.id } });
    if (!wr) return res.status(404).json({ error: "Withdraw not found" });
    if (wr.status !== "PENDING") {
      return res.status(400).json({ error: "Withdraw not in PENDING state" });
    }

    // Débit + mise à jour (transaction)
    const result = await prisma.$transaction(async (tx) => {
      // contrôler le solde
      const wallet = await tx.walletAccount.findUnique({ where: { userId: wr.userId }, select: { id: true, balance: true } });
      if (!wallet || wallet.balance < wr.amount) {
        throw new Error("Solde insuffisant");
      }
      const updatedWallet = await tx.walletAccount.update({ where: { id: wallet.id }, data: { balance: { decrement: wr.amount } } });
      const txRow = await tx.walletTransaction.create({
        data: {
          accountId: wallet.id,
          type: "DEBIT",
          amount: wr.amount,
          reference: `WITHDRAW_APPROVED:${wr.method || "manual"}`,
          balanceBefore: wallet.balance,
          balanceAfter: updatedWallet.balance,
        },
      });
      const updatedWr = await tx.withdrawRequest.update({
        where: { id: wr.id },
        data: { status: "APPROVED", approvedAt: new Date(), approvedById: adminId || undefined, processedAt: new Date(), txId: txRow.id },
      });
      return { tx: txRow, wr: updatedWr };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// Withdraw reject
// ───────────────────────────────────────────────
router.patch("/withdraws/:id/reject", validateParams(WithdrawIdParam), async (req, res, next) => {
  try {
    const adminId = req.user?.id;
    const wr = await prisma.withdrawRequest.findUnique({ where: { id: req.params.id } });
    if (!wr) return res.status(404).json({ error: "Withdraw not found" });
    if (wr.status !== "PENDING") {
      return res.status(400).json({ error: "Withdraw not in PENDING state" });
    }
    const updated = await prisma.withdrawRequest.update({
      where: { id: wr.id },
      data: { status: "REJECTED", approvedAt: new Date(), approvedById: adminId || undefined },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// Contracts
// ───────────────────────────────────────────────
router.get("/contracts", validateQuery(QueryPagination), async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;
    const limit = Math.min(req.query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      prisma.contract.count(),
    ]);

    res.json({ success: true, page, limit, total, data: contracts });
  } catch (err) {
    console.error("[GET /admin/contracts]", err);
    next(err);
  }
});

router.get("/contracts/:id", async (req, res, next) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    res.json({ success: true, data: contract });
  } catch (err) {
    console.error("[GET /admin/contracts/:id]", err);
    next(err);
  }
});

router.delete("/contracts/:id", async (req, res, next) => {
  try {
    await prisma.contract.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Contract deleted" });
  } catch (err) {
    if (err?.code === "P2025") return res.status(404).json({ error: "Contract not found" });
    console.error("[DELETE /admin/contracts/:id]", err);
    next(err);
  }
});

// ───────────────────────────────────────────────
// Invoices
// ───────────────────────────────────────────────
router.get("/invoices", validateQuery(QueryPagination), async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;
    const limit = Math.min(req.query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take: limit,
        orderBy: { issuedAt: "desc" },
        include: {
          contract: {
            include: { user: { select: { id: true, email: true, name: true } } },
          },
        },
      }),
      prisma.invoice.count(),
    ]);

    res.json({ success: true, page, limit, total, data: invoices });
  } catch (err) {
    console.error("[GET /admin/invoices]", err);
    next(err);
  }
});

router.get("/invoices/:id", async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        contract: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
      },
    });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json({ success: true, data: invoice });
  } catch (err) {
    console.error("[GET /admin/invoices/:id]", err);
    next(err);
  }
});

router.delete("/invoices/:id", async (req, res, next) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    if (err?.code === "P2025") return res.status(404).json({ error: "Invoice not found" });
    console.error("[DELETE /admin/invoices/:id]", err);
    next(err);
  }
});

// ───────────────────────────────────────────────
// Invoice PDF download
// ───────────────────────────────────────────────
import fs from "fs";
import path from "path";

router.get("/invoices/:id/pdf", async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { file: true }, // ⚠️ il faut que Invoice ↔ File soit lié en DB
    });

    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    if (!invoice.file) return res.status(404).json({ error: "Invoice PDF not generated" });

    const filePath = path.join(process.cwd(), "uploads", invoice.file.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(410).json({ error: "Invoice PDF no longer exists" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${invoice.file.filename}`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("[GET /admin/invoices/:id/pdf]", err);
    next(err);
  }
});

// ───────────────────────────────────────────────
// Logs
// ───────────────────────────────────────────────
const LogQuery = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  action: z.string().optional(),
  adminId: z.string().cuid().optional(),
});
const LogIdParam = z.object({ id: z.string().cuid() });

router.get("/logs", validateQuery(LogQuery), async (req, res, next) => {
  try {
    const page = req.query.page ?? 1;
    const limit = Math.min(req.query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      ...(req.query.action ? { action: req.query.action } : {}),
      ...(req.query.adminId ? { adminId: req.query.adminId } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.adminActionLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { id: true, email: true, name: true } } },
      }),
      prisma.adminActionLog.count({ where }),
    ]);

    res.json({ success: true, page, limit, total, data: logs });
  } catch (err) {
    console.error("[GET /admin/logs]", err);
    next(err);
  }
});

router.get("/logs/:id", validateParams(LogIdParam), async (req, res, next) => {
  try {
    const log = await prisma.adminActionLog.findUnique({
      where: { id: req.params.id },
      include: { admin: { select: { id: true, email: true, name: true } } },
    });
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json({ success: true, data: log });
  } catch (err) {
    console.error("[GET /admin/logs/:id]", err);
    next(err);
  }
});

export default router;
