// backend/controllers/requestsController.js
import { prisma } from "../db/prisma.js";
import { HttpError } from "../middleware/httpError.js";
import matchingService from "../services/matchingService.js";
import { generateContract } from "../services/contractService.js";
import { sendRequestNotification } from "../services/notificationService.js";

/**
 * @name createRequest
 * @description Gère la création d'une nouvelle demande de service de maintenance.
 */
export const createRequest = async (req, res, next) => {
  try {
    const { propertyId, serviceType, description, clientInfo, urgent } = req.body;

    const requestData = { propertyId, serviceType, description, clientInfo, urgent };

    // 1. Trouver le meilleur fournisseur
    const provider = await matchingService.findBestProvider(requestData);

    if (!provider) {
      throw new HttpError(404, "Aucun fournisseur disponible n'a été trouvé.");
    }

    // 2. Persister la demande
    const record = await prisma.maintenanceRequest.create({
      data: {
        clientId: req.userId, // supposé venir du middleware d'auth
        propertyId,
        serviceType,
        description,
        clientInfo,
        urgent,
        providerId: provider.id,
        providerName: provider.name,
        providerDistanceKm: provider.distanceKm,
        contractUrl: "",
      },
    });

    // 3. Générer contrat et MAJ
    const contractUrl = await generateContract(requestData, provider, record.id);
    const updatedRecord = await prisma.maintenanceRequest.update({
      where: { id: record.id },
      data: { contractUrl },
    });

    // 4. Notifications
    await sendRequestNotification(updatedRecord, provider, contractUrl);

    // 5. Réponse
    res.status(201).json(updatedRecord);
  } catch (err) {
    console.error("Erreur lors de la création de la demande:", err);
    next(err);
  }
};

/**
 * @name updateStatus
 * @description Met à jour le statut d'une demande et enregistre l'historique.
 */
export const updateStatus = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const requestExists = await prisma.maintenanceRequest.findUnique({
      where: { id: requestId },
    });
    if (!requestExists) {
      throw new HttpError(404, `Demande #${requestId} introuvable`);
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: { status },
    });

    await prisma.statusHistory.create({ data: { requestId, status } });

    const history = await prisma.statusHistory.findMany({
      where: { requestId },
      orderBy: { timestamp: "asc" },
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("status_updated", { requestId, status, timestamp: new Date() });
    }

    res.json({ request: updated, history });
  } catch (err) {
    console.error(`Erreur MAJ statut demande ${req.params.id}:`, err);
    next(err);
  }
};

/**
 * @name getStatusHistory
 * @description Récupère l'historique des changements de statut pour une demande.
 */
export const getStatusHistory = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id, 10);
    const history = await prisma.statusHistory.findMany({
      where: { requestId },
      orderBy: { timestamp: "asc" },
    });
    res.json(history);
  } catch (err) {
    console.error(
      `Erreur récupération historique demande ${req.params.id}:`,
      err
    );
    next(err);
  }
};

// 👇 Ajout export default pour supporter `import requestsController from ...`
export default {
  createRequest,
  updateStatus,
  getStatusHistory,
};
