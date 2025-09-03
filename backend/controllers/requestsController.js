// backend/controllers/requestsController.js
import { prisma } from '../db/prisma.js';
import { HttpError } from '../middleware/httpError.js';
import matchingService from '../services/matchingService.js';
import { generateContract } from '../services/contractService.js';
import { sendRequestNotification } from '../services/notificationService.js';

/**
 * @name createRequest
 * @description Gère la création d'une nouvelle demande de service de maintenance.
 * @param {object} req - L'objet de requête Express. Attend les données de la demande dans req.body.
 * @param {object} res - L'objet de réponse Express.
 * @param {function} next - Le middleware suivant.
 */
export const createRequest = async (req, res, next) => {
  try {
    const { propertyId, serviceType, description, clientInfo, urgent } = req.body;
    
    // Données de la requête pour les services externes
    const requestData = { propertyId, serviceType, description, clientInfo, urgent };

    // 1. Trouver le meilleur fournisseur
    const provider = await matchingService.findBestProvider(requestData);

    if (!provider) {
      throw new HttpError(404, 'Aucun fournisseur disponible n\'a été trouvé.');
    }

    // 2. Persister la demande de maintenance dans la base de données
    const record = await prisma.maintenanceRequest.create({
      data: {
        clientId: req.userId, // supposé venir du middleware d'authentification
        propertyId,
        serviceType,
        description,
        clientInfo,
        urgent,
        providerId: provider.id,
        providerName: provider.name,
        providerDistanceKm: provider.distanceKm,
        contractUrl: '', // URL sera ajoutée plus tard
      },
    });

    // 3. Générer le contrat PDF et mettre à jour le record
    const contractUrl = await generateContract(requestData, provider, record.id);
    const updatedRecord = await prisma.maintenanceRequest.update({
      where: { id: record.id },
      data: { contractUrl },
    });

    // 4. Envoyer les notifications au client et au fournisseur
    await sendRequestNotification(updatedRecord, provider, contractUrl);

    // 5. Renvoyer la réponse
    res.status(201).json(updatedRecord);

  } catch (err) {
    console.error('Erreur lors de la création de la demande de maintenance:', err);
    // Passer l'erreur au middleware de gestion des erreurs
    next(err);
  }
};
