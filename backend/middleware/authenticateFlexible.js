// backend/middleware/authenticateFlexible.js
import jwt from "jsonwebtoken";

/**
 * Middleware flexible d'authentification
 * - En DEV : bypass avec MASTER_KEY (x-master-key header)
 * - En PROD : exige un JWT valide
 * - Ajoute req.user (payload JWT normalisé) et req.userId
 */
export function authenticateFlexible(req, _res, next) {
  const isProd = process.env.NODE_ENV === "production";
  const master = process.env.MASTER_KEY || process.env.VITE_MASTER_KEY;

  // 1) 🔑 Mode DEV : bypass avec master-key
  if (!isProd) {
    const key = req.header("x-master-key");
    if (key && master && key === master) {
      req.user = {
        id: "dev",
        email: "admin@mosaic.com",
        roles: ["ADMIN"],
        role: "admin",          // ✅ patch : expose aussi un champ simple
        via: "master-key",
      };
      req.userId = "dev";
      return next();
    }
  }

  // 2) 🔎 Chercher un token
  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ")
    ? auth.replace(/^Bearer\s+/i, "")
    : null;

  const raw =
    req.cookies?.session ||
    req.cookies?.token || // legacy
    bearer;

  if (!raw) {
    // Pas de jeton → utilisateur anonyme (mais accès non bloqué)
    req.user = null;
    req.userId = undefined;
    return next();
  }

  // 3) ✅ Vérifier le JWT
  try {
    const decoded = jwt.verify(raw, process.env.JWT_SECRET || "dev");

    // Normalisation : toujours un tableau de rôles
    const roles = Array.isArray(decoded.roles)
      ? decoded.roles
      : decoded.role
      ? [decoded.role]
      : [];

    req.user = {
      id: decoded.sub || decoded.id || decoded.userId || "unknown",
      email: decoded.email || "unknown",
      roles,
      role: roles.length ? roles[0].toLowerCase() : null, // ✅ patch
    };

    req.userId = req.user.id;
  } catch (err) {
    console.warn("⚠️ Jeton invalide:", err.message);
    req.user = null;
    req.userId = undefined;
  }

  return next();
}

export default authenticateFlexible;
