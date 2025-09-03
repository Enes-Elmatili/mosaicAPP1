// backend/services/exportService.js
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import prisma from "../db/prisma.js";
import fs from "fs";
import path from "path";

/**
 * Applique les filtres reçus dans la query
 */
function buildWhere(query = {}) {
  const where = {};

  if (query.status) where.status = query.status;
  if (query.service) where.serviceType = query.service;
  if (query.providerId) where.providerId = query.providerId;
  if (query.propertyId) where.propertyId = query.propertyId;
  if (query.priority) where.priority = query.priority;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }

  return where;
}

/**
 * Récupère toutes les demandes (Request + MaintenanceRequest)
 */
async function fetchAllRequests(query = {}) {
  const where = buildWhere(query);

  const [requests, maintenanceRequests] = await Promise.all([
    prisma.request.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.maintenanceRequest.findMany({ where, orderBy: { createdAt: "desc" } }),
  ]);

  return [
    ...requests.map(r => ({ type: "Request", ...r })),
    ...maintenanceRequests.map(r => ({ type: "MaintenanceRequest", ...r })),
  ];
}

/**
 * Exporte en CSV
 */
export async function getRequestsCsv(query = {}) {
  const all = await fetchAllRequests(query);

  if (all.length === 0) {
    return { csv: "Aucune donnée", filename: "requests.csv" };
  }

  const fields = Object.keys(all[0]); // toutes les colonnes
  const parser = new Parser({ fields });
  const csv = parser.parse(all);
  const filename = `requests_${new Date().toISOString().slice(0, 10)}.csv`;

  return { csv, filename };
}

/**
 * Exporte en PDF
 */
export async function getRequestsPdf(query = {}) {
  const all = await fetchAllRequests(query);
  const filename = `requests_${new Date().toISOString().slice(0, 10)}.pdf`;
  const filePath = path.join("/tmp", filename);

  const doc = new PDFDocument({ margin: 30, size: "A4" });
  const chunks = [];
  const stream = fs.createWriteStream(filePath);

  // 👉 on écrit à la fois dans le fichier et dans un buffer en mémoire
  doc.pipe(stream);
  doc.on("data", chunk => chunks.push(chunk));
  const endPromise = new Promise(resolve => doc.on("end", resolve));

  // Titre
  doc.fontSize(18).text("Export des demandes", { align: "center" });
  doc.moveDown(2);

  if (all.length === 0) {
    doc.fontSize(12).text("Aucune donnée disponible");
  } else {
    // Colonnes (5-6 champs pour lisibilité)
    doc.fontSize(12).text("ID | Type | Client | Service | Status | Date création");
    doc.moveDown();

    all.forEach(r => {
      doc.fontSize(10).text(
        `${r.id} | ${r.type} | ${r.clientId || "-"} | ${r.serviceType || "-"} | ${r.status || "-"} | ${r.createdAt}`
      );
    });
  }

  doc.end();
  await endPromise;

  // ✅ Buffer mémoire pour renvoyer direct au client
  const buffer = Buffer.concat(chunks);

  return { filePath, filename, buffer };
}

export default { getRequestsCsv, getRequestsPdf };
