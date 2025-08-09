// Controller for handling maintenance service requests
const { prisma } = require('../db/prisma');
const matchingService = require('../services/matchingService');
const { generateContract } = require('../services/contractService');
const { sendRequestNotification } = require('../services/notificationService');

/**
 * Handle creation of a maintenance service request.
 * Persists the request in DB, generates a PDF contract and sends notifications.
 */
async function createRequest(req, res, next) {
  try {
    const { propertyId, serviceType, description, clientInfo, urgent } = req.body;
    const requestData = { propertyId, serviceType, description, clientInfo, urgent };
    // Find best provider
    const provider = await matchingService.findBestProvider(requestData);

    // Persist maintenance request
    const record = await prisma.maintenanceRequest.create({
      data: {
        clientId: req.userId,
        propertyId,
        serviceType,
        description,
        clientInfo,
        urgent,
        providerId: provider.id,
        providerName: provider.name,
        providerDistanceKm: provider.distanceKm,
        contractUrl: '',
      },
    });

    // Generate PDF contract and update record
    const contractUrl = await generateContract(requestData, provider, record.id);
    const updated = await prisma.maintenanceRequest.update({
      where: { id: record.id },
      data: { contractUrl },
    });

    // Send email notifications to client and provider
    await sendRequestNotification(updated, provider, contractUrl);

    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { createRequest };
