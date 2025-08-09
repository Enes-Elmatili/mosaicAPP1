const { HttpError } = require('./httpError');
const jwt = require('jsonwebtoken');

/**
 * JWT authentication middleware: expects 'Authorization: Bearer <token>'.
 * Attaches req.userId and req.userRole.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

function authenticate(req, _res, next) {
  const auth = req.header('authorization') || '';
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) return next(new HttpError(401, 'Unauthorized'));
  try {
    const payload = jwt.verify(match[1], JWT_SECRET);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    next(new HttpError(401, 'Unauthorized'));
  }
}

/**
 * Flexible auth for development: accept x-master-key header when not in production.
 * If header matches env MASTER_KEY or VITE_MASTER_KEY, bypass JWT and set a fake user.
 * Falls back to JWT otherwise.
 */
function authenticateFlexible(req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const masterKey = process.env.MASTER_KEY || process.env.VITE_MASTER_KEY;
  const provided = req.header('x-master-key');
  if (!isProd && masterKey && provided && provided === masterKey) {
    // Allow overriding user id via header in dev for testing
    req.userId = req.header('x-user-id') || 'dev-user';
    req.userRole = req.header('x-user-role') || 'tenant';
    return next();
  }
  return authenticate(req, res, next);
}

module.exports = { authenticate, authenticateFlexible };
