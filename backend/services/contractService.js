// backend/services/contractService.js
import PDFDocument from "pdfkit";
import fs from "fs";
import fsp from "fs/promises"; // version Promises
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Génère un contrat PDF pour une demande donnée
 * @param {object} requestData - Données de la demande
 * @param {object} provider - Informations du fournisseur
 * @param {string|number} requestId - ID unique de la demande
 * @returns {Promise<string>} URL publique du PDF
 */
export async function generateContract(requestData, provider, requestId) {
  try {
    const contractsDir = path.join(process.cwd(), "uploads", "contracts");
    await fsp.mkdir(contractsDir, { recursive: true });

    const filename = `contract_${requestId}.pdf`;
    const filePath = path.join(contractsDir, filename);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ---- HEADER ----
    doc.fontSize(18).text("Contrat de maintenance", { align: "center" });
    doc.moveDown();

    // ---- Détails demande ----
    doc.fontSize(12)
      .text(`Request ID: ${requestId}`)
      .text(`Property ID: ${requestData.propertyId ?? "N/A"}`)
      .text(`Service Type: ${requestData.serviceType ?? "N/A"}`)
      .text(`Description: ${requestData.description ?? "N/A"}`)
      .text(`Client Info: ${requestData.clientInfo ?? "N/A"}`)
      .text(`Urgent: ${requestData.urgent ? "Oui" : "Non"}`)
      .moveDown();

    // ---- Détails fournisseur ----
    if (provider) {
      doc.fontSize(12)
        .text(`Fournisseur: ${provider.name ?? "N/A"} (ID: ${provider.id ?? "?"})`)
        .text(`Distance: ${provider.distanceKm ?? "?"} km`)
        .moveDown();
    }

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    // URL publique
    return `/api/uploads/contracts/${filename}`;
  } catch (error) {
    console.error("❌ Erreur génération contrat PDF:", error);
    throw error;
  }
}

/**
 * Génère une facture PDF pour une demande terminée
 * @param {object} request - Données de la demande
 * @param {object} contract - Contrat lié
 * @returns {Promise<string>} URL publique du PDF
 */
export async function generateInvoice(request, contract) {
  try {
    const invoicesDir = path.join(process.cwd(), "uploads", "invoices");
    await fsp.mkdir(invoicesDir, { recursive: true });

    const filename = `invoice_${request.id}.pdf`;
    const filePath = path.join(invoicesDir, filename);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ---- HEADER ----
    doc.fontSize(18).text("FACTURE", { align: "center" });
    doc.moveDown();

    // ---- Détails facture ----
    doc.fontSize(12)
      .text(`Request ID: ${request.id}`)
      .text(`Contrat ID: ${contract?.id ?? "N/A"}`)
      .text(`Montant: ${request.price ?? 0} MAD`)
      .text(`Date: ${new Date().toLocaleDateString("fr-FR")}`)
      .moveDown();

    // ---- Parties ----
    doc.fontSize(12)
      .text(`Client: ${request.user?.email ?? "N/A"}`)
      .text(`Provider: ${request.provider?.name ?? "N/A"}`)
      .moveDown();

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    return `/api/uploads/invoices/${filename}`;
  } catch (error) {
    console.error("❌ Erreur génération facture PDF:", error);
    throw error;
  }
}

export default {
  generateContract,
  generateInvoice,
};
