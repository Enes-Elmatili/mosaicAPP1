// backend/middleware/authorizeStatusChange.js (ESM)
import { HttpError } from './httpError.js';
import { prisma } from '../db/prisma.js';

// Rôles canoniques (UPPERCASE)
const ALLOWED_ROLES = new Set(['TENANT', 'OWNER', 'PROVIDER', 'ADMIN']);

// Alias de rôles (ancien → canonique)
const ROLE_ALIASES = {
  admin: 'ADMIN',
  client: 'TENANT',
  tenant: 'TENANT',
  owner: 'OWNER',
  proprietaire: 'OWNER',
  prestataire: 'PROVIDER',
  provider: 'PROVIDER',
};

// Statuts canoniques (UPPERCASE)
const CANON_STATUSES = new Set([
  'PUBLISHED',   // ex: demande créée/en attente
  'ASSIGNED',    // assignée à un prestataire
  'IN_PROGRESS', // en cours
  'DONE',        // terminé
  'CANCELLED',   // annulé par le tenant
  'CLOSED',      // clôturé (owner/admin)
]);

// Alias de statuts (ancien → canonique)
const STATUS_ALIASES = {
  pending: 'PUBLISHED',
  published: 'PUBLISHED',
  assign: 'ASSIGNED',
  assigned: 'ASSIGNED',
  'in-progress': 'IN_PROGRESS',
  in_progress: 'IN_PROGRESS',
  done: 'DONE',
  cancelled: 'CANCELLED',
  canceled: 'CANCELLED',
  closed: 'CLOSED',
};

// Matrice de transitions par rôle
// ADMIN: tout est permis
const TRANSITIONS = {
  TENANT: {
    PUBLISHED: ['CANCELLED'], // un tenant peut annuler sa demande encore "ouverte"
  },
  PROVIDER: {
    ASSIGNED: ['IN_PROGRESS'],
    IN_PROGRESS: ['DONE'],
  },
  OWNER: {
    PUBLISHED: ['ASSIGNED'],  // l'owner assigne un prestataire
    DONE: ['CLOSED'],         // l'owner clôture après validation
    CANCELLED: ['CLOSED'],    // l'owner clôture une demande annulée
  },
  ADMIN: '*',
};

// Utils
function toCanonicalRole(r) {
  if (!r) return null;
  const s = String(r).trim().toLowerCase();
  const mapped = ROLE_ALIASES[s] || s.toUpperCase();
  return ALLOWED_ROLES.has(mapped) ? mapped : null;
}

function toCanonicalRoles(input) {
  const arr = Array.isArray(input) ? input : input ? [input] : [];
  const out = [];
  for (const r of arr) {
    const canon = toCanonicalRole(r?.name || r?.key || r?.code || r);
    if (canon) out.push(canon);
  }
  return Array.from(new Set(out));
}

function toCanonicalStatus(s) {
  if (!s) return null;
  const raw = String(s).trim();
  const key = raw.replace(/[-\s]/g, '_').toLowerCase(); // in-progress, in progress → in_progress
  const mapped = STATUS_ALIASES[key] || raw.toUpperCase();
  return CANON_STATUSES.has(mapped) ? mapped : null;
}

function isAllowedTransition(current, next, roles) {
  if (roles.includes('ADMIN')) return true;
  for (const role of roles) {
    const rules = TRANSITIONS[role];
    if (!rules) continue;
    if (rules === '*') return true;
    const allowedNext = rules[current] || [];
    if (allowedNext.includes(next)) return true;
  }
  return false;
}

/**
 * Express middleware: charge la maintenanceRequest, vérifie la transition selon les rôles de l’utilisateur,
 * et attache le record à req.maintenanceRequest.
 *
 * Hypothèses de champs (si dispo) pour scoper les droits:
 *  - record.requesterId (TENANT)
 *  - record.ownerId (OWNER)
 *  - record.providerId (PROVIDER)
 * S’ils n’existent pas, le scope est ignoré.
 */
export async function requireStatusAuth(req, _res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new HttpError(400, 'Invalid request id');

    const record = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!record) throw new HttpError(404, 'Request not found');

    const current = toCanonicalStatus(record.status);
    if (!current) throw new HttpError(500, `Unknown current status: ${record.status}`);

    const nextStatus = toCanonicalStatus(req.body?.status);
    if (!nextStatus) throw new HttpError(400, 'Missing or invalid next status');

    // No-op: même statut → autoriser (aucun changement réel)
    if (current === nextStatus) {
      req.maintenanceRequest = record;
      return next();
    }

    // Rôles de l’utilisateur (issus de ton middleware authenticate)
    const roles = toCanonicalRoles(req.userRoles || req.userRole || []);
    if (!roles.length) throw new HttpError(401, 'Unauthenticated or role missing');

    // Scopes (si les colonnes existent)
    const uid = req.userId;
    if (uid && !roles.includes('ADMIN')) {
      if (roles.includes('TENANT') && record.requesterId && record.requesterId !== uid) {
        throw new HttpError(403, 'Forbidden: not your request');
      }
      if (roles.includes('OWNER') && record.ownerId && record.ownerId !== uid) {
        throw new HttpError(403, 'Forbidden: not your property');
      }
      if (roles.includes('PROVIDER') && record.providerId && record.providerId !== uid) {
        throw new HttpError(403, 'Forbidden: not your assignment');
      }
    }

    // Règle de transition
    if (!isAllowedTransition(current, nextStatus, roles)) {
      throw new HttpError(403, `Forbidden: cannot change status from ${current} to ${nextStatus}`);
    }

    req.maintenanceRequest = record;
    return next();
  } catch (err) {
    return next(err);
  }
}

export const authorizeStatusChange = isAllowedTransition;
export default { requireStatusAuth, authorizeStatusChange };
