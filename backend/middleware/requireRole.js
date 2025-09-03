// backend/middleware/requireRole.js
/**
 * @typedef {"ADMIN" | "PROVIDER" | "CLIENT"} Role
 *
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} email
 * @property {Role[]} roles
 */

/**
 * Middleware de contrôle RBAC
 * Vérifie que l'utilisateur connecté possède au moins un des rôles autorisés.
 *
 * @param {...Role} roles - Liste des rôles autorisés
 * @returns {import("express").RequestHandler}
 */
export function requireRole(...roles) {
    return (req, res, next) => {
      try {
        /** @type {AuthUser|undefined} */
        const user = req.user;
  
        if (!user) {
          res.status(401).json({ error: "Unauthorized: user not authenticated" });
          return;
        }
  
        if (!Array.isArray(user.roles) || user.roles.length === 0) {
          res.status(403).json({ error: "Forbidden: no roles assigned" });
          return;
        }
  
        const hasRole = user.roles.some((r) => roles.includes(r));
  
        if (!hasRole) {
          res.status(403).json({ error: "Forbidden: insufficient role" });
          return;
        }
  
        next();
      } catch (err) {
        console.error("[requireRole] error:", err);
        res.status(500).json({ error: "Internal Server Error" });
      }
    };
  }
  