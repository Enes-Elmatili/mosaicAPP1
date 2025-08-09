// Middleware to authorize status transitions on MaintenanceRequest
const { HttpError } = require('./httpError');

/**
 * Checks whether the req.userRole can transition from currentStatus to newStatus.
 */
function authorizeStatusChange(currentStatus, newStatus, role) {
  if (role === 'admin') return true;
  if (role === 'client') {
    // Clients can only cancel a pending request
    return currentStatus === 'pending' && newStatus === 'cancelled';
  }
  if (role === 'prestataire') {
    // Prestataires can move assigned->in_progress and in_progress->done
    return (currentStatus === 'assigned' && newStatus === 'in_progress') ||
           (currentStatus === 'in_progress' && newStatus === 'done');
  }
  return false;
}

/**
 * Express middleware: load request, check transition rights, attach record.
 */
async function requireStatusAuth(req, res, next) {
  const { prisma } = require('../db/prisma');
  const requestId = parseInt(req.params.id, 10);
  const record = await prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
  if (!record) return next(new HttpError(404, 'Request not found'));
  const newStatus = req.body.status;
  if (!authorizeStatusChange(record.status, newStatus, req.userRole)) {
    return next(new HttpError(403, 'Forbidden: cannot change status to ' + newStatus));
  }
  req.maintenanceRequest = record;
  next();
}

module.exports = { requireStatusAuth, authorizeStatusChange };
