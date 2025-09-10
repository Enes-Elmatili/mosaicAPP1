// backend/middleware/authenticate.js (ESM)
import jwt from 'jsonwebtoken';

// Utilisez une variable d'environnement pour le secret JWT.
// 'dev' est une bonne valeur par défaut, mais ne doit pas être utilisée en production.
const JWT_SECRET = process.env.JWT_SECRET || 'dev';

/**
 * Récupère un jeton JWT depuis:
 * - cookie "session" (nouveau standard)
 * - cookie "token" (legacy)
 * - Authorization: Bearer <jwt>
 */
function extractToken(req) {
  // cookies d'abord (plus fiable en app web)
  if (req.cookies?.session) return req.cookies.session;
  if (req.cookies?.token) return req.cookies.token; // legacy

  // sinon Bearer
  const auth = req.headers.authorization || '';
  if (/^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, '');
  return null;
}

/**
 * Normalise les champs userId / user sur req
 */
function attachUser(req, decoded) {
  // on accepte plusieurs conventions de payload
  const userId = decoded.sub || decoded.userId || decoded.id;
  if (!userId) throw new Error('No subject in token');

  req.user = decoded;          // payload complet (peut contenir email, roles, etc.)
  req.userId = userId;         // champ standardisé
  // Optionnel: rôle(s). Normalisation des rôles en majuscules pour la cohérence.
  req.userRole = (decoded.role || decoded.userRole || '').toUpperCase() || null;
  req.userRoles = (decoded.roles || (decoded.role ? [decoded.role] : [])).map(r => r.toUpperCase());
}

/**
 * Strict: exige une session valide ou renvoie 401
 */
export function authenticate(req, res, next) {
  try {
    const raw = extractToken(req);
    if (!raw) return res.status(401).json({ error: 'Unauthenticated' });

    const decoded = jwt.verify(raw, JWT_SECRET);
    attachUser(req, decoded);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid session' });
  }
}

/**
 * Flexible: n'exige rien.
 * - S'il y a un token valide → hydrate req.user / req.userId
 * - Sinon → laisse passer (req.user = null)
 * - En DEV: autorise x-master-key pour bypass (pratique pour tests)
 */
export function authenticateFlexible(req, _res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const master = process.env.MASTER_KEY || process.env.VITE_MASTER_KEY;
  const provided = req.header('x-master-key');

  // Logic pour la master key en environnement de développement
  if (!isProd && master && provided && provided === master) {
    const devUserId = req.header('x-user-id') || 'dev';
    const devRole = (req.header('x-user-role') || 'ADMIN').toUpperCase();
    req.user = { sub: devUserId, roles: [devRole], via: 'master-key' };
    req.userId = devUserId;
    req.userRole = devRole;
    req.userRoles = [devRole];
    return next();
  }

  // Si pas de master key, on essaie l'authentification normale
  const raw = extractToken(req);
  if (!raw) {
    req.user = null;
    req.userId = undefined;
    req.userRole = undefined;
    req.userRoles = [];
    return next();
  }

  try {
    const decoded = jwt.verify(raw, JWT_SECRET);
    attachUser(req, decoded);
  } catch {
    // en mode flexible, les erreurs de token sont silencieusement ignorées
    req.user = null;
    req.userId = undefined;
    req.userRole = undefined;
    req.userRoles = [];
  }
  return next();
}

// Backward compatibility aliases
export const authenticateStrict = authenticate;
export default authenticate;
