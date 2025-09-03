// backend/routes/permissions.js
import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "../validation/permission.js";
import permissionService from "../services/permissionService.js";
import { HttpError } from "../middleware/httpError.js";

const router = express.Router();

/**
 * GET /permissions - Liste toutes les permissions
 * Accessible ADMIN uniquement
 */
router.get(
  "/",
  authenticate,
  requireRole("ADMIN"),
  async (_req, res, next) => {
    try {
      const data = await permissionService.listPermissions();
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

/**
 * POST /permissions - Crée une permission
 * Accessible ADMIN uniquement
 */
router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(createPermissionSchema),
  async (req, res, next) => {
    try {
      const data = await permissionService.createPermission(req.body);
      res.status(201).json(data);
    } catch (e) {
      if (e.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Une permission avec cette clé existe déjà" });
      }
      next(e);
    }
  }
);

/**
 * GET /permissions/:id - Récupère une permission par ID
 * Accessible ADMIN uniquement
 */
router.get(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      const data = await permissionService.getPermission(req.params.id);
      if (!data) return next(new HttpError(404, "Permission not found"));
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

/**
 * PATCH /permissions/:id - Met à jour une permission
 * Accessible ADMIN uniquement
 */
router.patch(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  validate(updatePermissionSchema),
  async (req, res, next) => {
    try {
      const data = await permissionService.updatePermission(
        req.params.id,
        req.body
      );
      res.json(data);
    } catch (e) {
      if (e.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Une permission avec cette clé existe déjà" });
      }
      if (e.code === "P2025") {
        return res.status(404).json({ error: "Permission not found" });
      }
      next(e);
    }
  }
);

/**
 * DELETE /permissions/:id - Supprime une permission
 * Accessible ADMIN uniquement
 */
router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  async (req, res, next) => {
    try {
      await permissionService.deletePermission(req.params.id);
      res.status(204).end();
    } catch (e) {
      if (e.code === "P2025") {
        return res.status(404).json({ error: "Permission not found" });
      }
      if (e.code === "P2003") {
        return res.status(409).json({
          error:
            "Impossible de supprimer cette permission car elle est encore utilisée.",
        });
      }
      next(e);
    }
  }
);

export default router;
