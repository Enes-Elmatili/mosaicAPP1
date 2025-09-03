// backend/routes/matching.js
import { Router } from "express";
import { findBestProvider } from "../services/matchingService.js";
import { HttpError } from "../middleware/httpError.js";

const router = Router();

/**
 * @route POST /api/matching/:requestId
 * @desc Trouve le meilleur provider pour une requête donnée
 * @access Protégé (à sécuriser avec auth si besoin)
 */
router.post("/:requestId", async (req, res, next) => {
  try {
    const { requestId } = req.params;

    if (!requestId) {
      return next(new HttpError(400, "Missing requestId"));
    }

    const provider = await findBestProvider(Number(requestId));

    if (!provider) {
      return next(new HttpError(404, "Aucun provider disponible"));
    }

    res.json(provider);
  } catch (err) {
    next(err);
  }
});

export default router;
