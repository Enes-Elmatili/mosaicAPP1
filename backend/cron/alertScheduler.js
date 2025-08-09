// Cron scheduler: detect stalled maintenance requests and generate alerts
const cron = require('node-cron');
const { prisma } = require('../db/prisma');
const { sendAlertNotification } = require('../services/notificationService');

// Configurable thresholds in hours (fallback: pending=24h, in_progress=12h)
const THRESHOLDS = {
  pending: parseInt(process.env.PENDING_THRESHOLD_HOURS, 10) || 24,
  in_progress: parseInt(process.env.INPROG_THRESHOLD_HOURS, 10) || 12,
};

/**
 * Runs every hour at minute 0 to check for stalled requests.
 * Creates an Alert and sends notifications for each overdue request.
 */
cron.schedule('0 * * * *', async () => {
  console.log('🔍 Running alert scheduler at', new Date().toISOString());
  const now = new Date();
  for (const [status, hours] of Object.entries(THRESHOLDS)) {
    const cutoff = new Date(now.getTime() - hours * 3600000);
    const staleRequests = await prisma.maintenanceRequest.findMany({
      where: { status, updatedAt: { lt: cutoff } },
    });
    for (const req of staleRequests) {
      const alertType = `${status}_overdue`;
      const message = `La demande #${req.id} est en statut "${status}" depuis plus de ${hours}h.`;
      const alert = await prisma.alert.create({
        data: { requestId: req.id, type: alertType, message },
      });
      await sendAlertNotification(alert, req);
    }
  }
});
