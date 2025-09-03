// backend/routes/export.js
import express from "express";
import { getRequestsCsv, getRequestsPdf } from "../services/exportService.js";
import { HttpError } from "../middleware/httpError.js";
import { authenticateFlexible } from "../middleware/authenticateFlexible.js";

const router = express.Router();

/**
 * GET /api/export/requests.csv
 * Export des demandes en CSV
 */
router.get("/requests.csv", authenticateFlexible, async (req, res, next) => {
  try {
    const role = (req.user?.role || req.userRole || "").toString().toLowerCase();
    if (role !== "admin") {
      return next(new HttpError(403, "Forbidden"));
    }

    const { csv, filename } = await getRequestsCsv(req.query);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (err) {
    console.error("[export/requests.csv]", err);
    next(err);
  }
});

/**
 * GET /api/export/requests.pdf
 * Export des demandes en PDF
 */
router.get("/requests.pdf", authenticateFlexible, async (req, res, next) => {
  try {
    const role = (req.user?.role || req.userRole || "").toString().toLowerCase();
    if (role !== "admin") {
      return next(new HttpError(403, "Forbidden"));
    }

    const { filePath, filename } = await getRequestsPdf(req.query);
    res.download(filePath, filename);
  } catch (err) {
    console.error("[export/requests.pdf]", err);
    next(err);
  }
});

export default router;
