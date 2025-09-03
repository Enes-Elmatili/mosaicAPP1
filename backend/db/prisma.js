// backend/db/prisma.js
// PrismaClient singleton (JavaScript pur, compatible ESM)

import { PrismaClient } from "@prisma/client";

const NODE_ENV = process.env.NODE_ENV || "development";
const PRISMA_LOG_QUERY = process.env.PRISMA_LOG_QUERY === "1";
const PRISMA_LOG_LEVEL = (process.env.PRISMA_LOG_LEVEL || "warn,error")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ERROR_FORMAT = process.env.PRISMA_ERROR_FORMAT || "colorless"; 
const FORCE_DB_URL = process.env.DATABASE_URL || undefined;

// Masquer les paramètres sensibles dans les logs
function maskParams(p) {
  try {
    const obj = typeof p === "string" ? JSON.parse(p) : p;
    const s = JSON.stringify(obj, (_key, val) => {
      if (typeof val === "string" && val.length > 500) return val.slice(0, 500) + "…";
      return val;
    });
    return s.slice(0, 5000);
  } catch {
    const str = String(p ?? "");
    return str.length > 1000 ? str.slice(0, 1000) + "…" : str;
  }
}

// Factory
function createPrisma() {
  const client = new PrismaClient({
    errorFormat: ERROR_FORMAT,
    log: PRISMA_LOG_LEVEL,
    datasources: FORCE_DB_URL ? { db: { url: FORCE_DB_URL } } : undefined,
  });

  if (PRISMA_LOG_QUERY) {
    client.$on("query", (e) => {
      console.log(
        JSON.stringify({
          t: new Date().toISOString(),
          type: "prisma_query",
          duration_ms: e.duration,
          target: e.target,
          query: e.query,
          params: maskParams(e.params),
        })
      );
    });
  }

  client.$on("warn", (e) => {
    console.warn(JSON.stringify({ t: new Date().toISOString(), type: "prisma_warn", ...e }));
  });
  client.$on("error", (e) => {
    console.error(JSON.stringify({ t: new Date().toISOString(), type: "prisma_error", ...e }));
  });

  return client;
}

// Singleton (hot-reload safe)
if (!globalThis.__PRISMA__) {
  globalThis.__PRISMA__ = createPrisma();
}

// 🔥 Export unique (nommé + par défaut, même référence)
export const prisma = globalThis.__PRISMA__;
export default prisma;

// Helpers
export async function connectPrisma() {
  try {
    await prisma.$connect();
    if (NODE_ENV !== "production") {
      console.log("[prisma] connected");
    }
  } catch (e) {
    console.error("[prisma] connect error:", e);
    throw e;
  }
}

export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    if (NODE_ENV !== "production") {
      console.log("[prisma] disconnected");
    }
  } catch (e) {
    console.error("[prisma] disconnect error:", e);
  }
}

export async function prismaHealthCheck() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - start };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - start, error: String(e?.message || e) };
  }
}

export async function withTransaction(cb, options) {
  return prisma.$transaction(async (tx) => cb(tx), options);
}

let shutdownRegistered = false;
export function registerPrismaShutdownSignals() {
  if (shutdownRegistered) return;
  const handler = (signal) => async () => {
    try {
      if (NODE_ENV !== "production") {
        console.log(`[prisma] ${signal} received -> disconnect`);
      }
      await disconnectPrisma();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", handler("SIGINT"));
  process.on("SIGTERM", handler("SIGTERM"));
  shutdownRegistered = true;
}
