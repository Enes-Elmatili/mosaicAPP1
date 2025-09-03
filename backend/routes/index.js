// backend/routes/index.js
import express from "express";

// ─── Import des sous-routeurs ─────────────────────────────
import authRouter from "./auth.js";
import meRouter from "./me.js";
import usersRouter from "./users.js";
import rolesRouter from "./roles.js";
import permissionsRouter from "./permissions.js";
import statsRouter from "./stats.js";
import exportRouter from "./export.js";

import contractsRouter from "./contracts.js";
import subscriptionRouter from "./subscription.js";
import paymentsRouter from "./payments.js";
import walletRouter from "./wallet.js";

import providersRouter from "./providers.js";
import providersMissionsRouter from "./providers.missions.js";
import providersRankedRouter from "./providers.ranked.js";
import providersTopRouter from "./providers.top.js";

import requestsActionsRouter from "./requests.actions.js";
import requestsCreateRouter from "./requests.create.js";
import requestsReadRouter from "./requests.read.js";

import ticketsRouter from "./tickets.js";
import notificationsRouter from "./notifications.js";
import messagesRouter from "./messages.js";
import ratingsRouter from "./ratings.js";
import uploadsRouter from "./uploads.js";

import adminRouter from "./admin.js"; // 👈 carrefour principal admin
import adminUsersRouter from "./admin.user.js"; // 👈 CRUD & détail user
import adminProvidersRouter from "./admin.providers.js"; // 👈 gestion provider
import catalogRouter from "./catalog.js"; // 👈 catalogue admin (vue users)

// ─── Router principal ────────────────────────────────────
const router = express.Router({
  caseSensitive: false,
  strict: false,
});

// ─── Debug helper (pour détecter un export foireux) ───────
function safeUse(path, subrouter) {
  if (!subrouter || typeof subrouter !== "function") {
    console.error(`❌ Router invalide pour ${path}`, subrouter);
    return;
  }
  router.use(path, subrouter);
}

// ─── Routes système ──────────────────────────────────────
router.get("/", (_req, res) => {
  res.json({ status: "MOSAIC API up", ts: new Date().toISOString() });
});

const healthHandler = (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ status: "ok", uptime: process.uptime() });
};
router.get("/health", healthHandler);
router.head("/health", healthHandler);

// ─── Montage des sous-routeurs ───────────────────────────

// Auth & Users
safeUse("/auth", authRouter);
safeUse("/me", meRouter);
safeUse("/users", usersRouter);
safeUse("/roles", rolesRouter);
safeUse("/permissions", permissionsRouter);

// Stats & Export
safeUse("/stats", statsRouter);
safeUse("/export", exportRouter);

// Business: contracts, subs, payments, wallet
safeUse("/contracts", contractsRouter);
safeUse("/subscription", subscriptionRouter);
safeUse("/payments", paymentsRouter);
safeUse("/wallet", walletRouter);

// Providers
safeUse("/providers", providersRouter);
safeUse("/providers/missions", providersMissionsRouter);
safeUse("/providers/ranked", providersRankedRouter);
safeUse("/providers/top", providersTopRouter);

// Requests
safeUse("/requests/actions", requestsActionsRouter);
safeUse("/requests/create", requestsCreateRouter);
safeUse("/requests/read", requestsReadRouter);

// Tickets & comms
safeUse("/tickets", ticketsRouter);
safeUse("/notifications", notificationsRouter);
safeUse("/messages", messagesRouter);
safeUse("/ratings", ratingsRouter);
safeUse("/uploads", uploadsRouter);

// Admin (arbitre & carrefour)
safeUse("/admin", adminRouter);
safeUse("/admin/users", adminUsersRouter);
safeUse("/admin/providers", adminProvidersRouter);
safeUse("/admin/catalog", catalogRouter);

// ─── 404 API ─────────────────────────────────────────────
router.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

export default router;
