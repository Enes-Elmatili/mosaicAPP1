// backend/services/alertschedule.js
import cron from 'node-cron';
import prisma from '../db/prisma.js';
import { sendAlertNotification } from '../services/notificationService.js';

// Seuils de configuration en heures (valeurs par défaut: pending=24h, in_progress=12h)
const THRESHOLDS = {
  pending: parseInt(process.env.PENDING_THRESHOLD_HOURS, 10) || 24,
  in_progress: parseInt(process.env.INPROG_THRESHOLD_HOURS, 10) || 12,
};

/**
 * @name startAlertScheduler
 * @description Démarre la tâche planifiée pour détecter les demandes de maintenance bloquées.
 * La tâche s'exécute toutes les heures à la minute 0.
 */
const startAlertScheduler = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('🔍 Exécution du planificateur d\'alertes à', new Date().toISOString());
    const now = new Date();
    
    // Parcourir chaque statut et son seuil respectif
    for (const [status, hours] of Object.entries(THRESHOLDS)) {
      const cutoff = new Date(now.getTime() - hours * 3600000); // 3600000 ms dans 1h
      
      try {
        // Trouver toutes les demandes dont le statut et la date de mise à jour dépassent le seuil
        const staleRequests = await prisma.maintenanceRequest.findMany({
          where: { status, updatedAt: { lt: cutoff } },
        });

        console.log(`- Trouvé ${staleRequests.length} demandes en statut "${status}" dépassé.`);

        // Pour chaque demande, créer une alerte et envoyer une notification
        for (const req of staleRequests) {
          const alertType = `${status}_overdue`;
          const message = `La demande #${req.id} est en statut "${status}" depuis plus de ${hours}h.`;
          
          const alert = await prisma.alert.create({
            data: { requestId: req.id, type: alertType, message },
          });

          await sendAlertNotification(alert, req);
          console.log(`  → Alerte créée et notification envoyée pour la demande #${req.id}`);
        }
      } catch (error) {
        console.error(`Erreur lors de la vérification des requêtes "${status}":`, error);
      }
    }
  });

  console.log('⏰ Planificateur d\'alertes démarré.');
};

export default startAlertScheduler;
