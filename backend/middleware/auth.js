import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";

// Récupère la clé secrète (⚠️ stocke-la en .env)
const JWT_SECRET = process.env.JWT_SECRET || "changeme-secret";

/**
 * Vérifie un token JWT → renvoie l'user si valide, sinon null.
 */
async function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    return user;
  } catch {
    return null;
  }
}

/**
 * 🔒 Strict → bloque si pas d'utilisateur connecté.
 */
export async function authenticateStrict(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];
  const user = await verifyToken(token);

  if (!user) {
    return res.status(401).json({ code: "INVALID_TOKEN", message: "Token invalide ou expiré" });
  }

  req.user = user; // ✅ injecte user dans la requête
  next();
}

/**
 * 🟢 Flexible → ne bloque pas si pas de token, ajoute req.user si dispo.
 */
export async function authenticateFlexible(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next(); // ✅ passe quand même
}
