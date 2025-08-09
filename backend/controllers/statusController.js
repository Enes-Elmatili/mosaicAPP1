// Controller for managing maintenance request status changes
const { prisma } = require('../db/prisma');

/**
 * Update the status of a maintenance request and record history.
 * Expects { status } in req.body.
 */
async function updateStatus(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status } = req.body;
    // Update main record
    const updated = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: { status },
    });
    // Record history
    await prisma.statusHistory.create({
      data: { requestId, status },
    });
    // Fetch full history
    const history = await prisma.statusHistory.findMany({
      where: { requestId },
      orderBy: { timestamp: 'asc' },
    });
    // Emit real-time notification via Socket.io
    const io = req.app.get('io');
    io.emit('status_updated', { requestId, status, timestamp: new Date() });
    res.json({ request: updated, history });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve status change history for a given maintenance request.
 */
async function getStatusHistory(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const history = await prisma.statusHistory.findMany({
      where: { requestId },
      orderBy: { timestamp: 'asc' },
    });
    res.json(history);
  } catch (err) {
    next(err);
  }
}

module.exports = { updateStatus, getStatusHistory };
