import jwt from "jsonwebtoken";

export default function authenticateStrict(req, res, next) {
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
    req.cookies?.session ||
    req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev");
    const roles = Array.isArray(decoded.roles)
      ? decoded.roles
      : decoded.role
      ? [decoded.role]
      : [];

    req.user = {
      id: decoded.sub || decoded.id || decoded.userId,
      email: decoded.email || "unknown",
      roles,
      role: roles.length ? roles[0].toLowerCase() : null,
    };
    req.userId = req.user.id;

    next();
  } catch (err) {
    console.warn("[authenticateStrict] Invalid token:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
