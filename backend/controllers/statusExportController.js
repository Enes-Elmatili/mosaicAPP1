// backend/controllers/statusExportController.js
import { prisma } from '../db/prisma.js';
import { toCsv } from '../utils/csv.js';
import { HttpError } from '../middleware/httpError.js';

/**
 * @name exportStatusHistory
 * @description Exporte l'historique des statuts de toutes les demandes au format CSV.
 * @param {object} query - Les paramètres de requête pour le filtrage (e.g. requestId, status).
 */
export const exportStatusHistory = async (query) => {
  try {
    const where = {};
    if (query.requestId) where.requestId = parseInt(query.requestId, 10);
    if (query.status) where.status = query.status;

    if (query.from || query.to) {
      where.timestamp = {};
      if (query.from) where.timestamp.gte = new Date(query.from);
      if (query.to) where.timestamp.lte = new Date(query.to);
    }
    
    const rows = await prisma.statusHistory.findMany({ 
      where, 
      orderBy: { timestamp: 'desc' } 
    });

    // Définir les en-têtes CSV
    const header = ['id', 'requestId', 'status', 'timestamp'];
    
    // Mapper les données des lignes
    const data = rows.map(r => ({
      id: r.id,
      requestId: r.requestId,
      status: r.status,
      timestamp: r.timestamp.toISOString(),
    }));
    
    // Générer le CSV
    const csvContent = toCsv(header, data);
    const filename = `status-history-${new Date().toISOString().slice(0, 10)}.csv`;

    return { csv: csvContent, filename };
  } catch (error) {
    console.error('Erreur lors de la génération du fichier CSV pour l\'historique des statuts:', error);
    throw new HttpError(500, 'Erreur interne du serveur lors de l\'exportation CSV.');
  }
};

/**
 * @name exportStatusHistoryController
 * @description Contrôleur pour gérer les requêtes d'exportation de l'historique des statuts.
 * @param {object} req - L'objet de requête Express.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le middleware suivant.
 */