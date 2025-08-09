// Controller to export status history of maintenance requests as PDF or CSV
const PDFDocument = require('pdfkit');
const { prisma } = require('../db/prisma');

/**
 * GET /requests/:id/status-history/export/pdf
 * Generate and stream a PDF timeline of status history entries.
 */
async function exportStatusHistoryPdf(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const history = await prisma.statusHistory.findMany({
      where: { requestId },
      orderBy: { timestamp: 'asc' },
    });
    // Set response headers for PDF attachment
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="status_history_${requestId}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
    doc.fontSize(16).text(`Status History for Request #${requestId}`, { align: 'center' });
    doc.moveDown();
    // Add each history entry
    history.forEach(entry => {
      doc.fontSize(12)
        .text(`- ${entry.status}`, { continued: true })
        .text(` on ${entry.timestamp.toISOString()}`, { align: 'right' });
      // Author not tracked; omitted
      doc.moveDown(0.5);
    });
    doc.end();
  } catch (err) {
    next(err);
  }
}

/**
 * GET /requests/:id/status-history/export/csv
 * Generate and stream a CSV file of status history entries.
 */
async function exportStatusHistoryCsv(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const history = await prisma.statusHistory.findMany({
      where: { requestId },
      orderBy: { timestamp: 'asc' },
    });
    // CSV header
    let csv = 'status,timestamp,author\n';
    history.forEach(entry => {
      const author = 'N/A'; // Author not tracked
      csv += `${entry.status},${entry.timestamp.toISOString()},${author}\n`;
    });
    // Set response headers for CSV attachment
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="status_history_${requestId}.csv"`
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

module.exports = { exportStatusHistoryPdf, exportStatusHistoryCsv };
