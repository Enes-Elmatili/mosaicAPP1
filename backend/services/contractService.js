// Service to generate contract/devis PDF for maintenance requests
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF contract for a maintenance request and save it to /contracts.
 * @param {object} requestData - Data of the maintenance request
 * @param {object} provider - Assigned provider info
 * @param {number|string} requestId - Unique ID of the request
 * @returns {Promise<string>} - Public URL path to the generated PDF
 */
async function generateContract(requestData, provider, requestId) {
  const contractsDir = path.join(process.cwd(), 'contracts');
  await fs.promises.mkdir(contractsDir, { recursive: true });
  const filename = `contract_${requestId}.pdf`;
  const filePath = path.join(contractsDir, filename);
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  
  // Header
  doc.fontSize(18).text('Contrat de maintenance', { align: 'center' });
  doc.moveDown();

  // Request details
  doc.fontSize(12)
    .text(`Request ID: ${requestId}`)
    .text(`Property ID: ${requestData.propertyId}`)
    .text(`Service Type: ${requestData.serviceType}`)
    .text(`Description: ${requestData.description}`)
    .text(`Client Info: ${requestData.clientInfo || 'N/A'}`)
    .text(`Urgent: ${requestData.urgent ? 'Yes' : 'No'}`)
    .moveDown();

  // Provider details
  doc.fontSize(12)
    .text(`Provider: ${provider.name} (ID: ${provider.id})`)
    .text(`Distance: ${provider.distanceKm} km`)
    .moveDown();

  doc.end();
  await new Promise(resolve => stream.on('finish', resolve));
  return `/contracts/${filename}`;
}

module.exports = { generateContract };
