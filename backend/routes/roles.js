// backend/routes/roles.js
import express from "express";
import { validate } from "../middleware/validate.js";
import {
  createRoleSchema,
  updateRoleSchema,
  updateRolePermissionsSchema,
} from "../validation/role.js";
import roles from "../services/roleService.js";
import { HttpError } from "../middleware/httpError.js";
import authenticateFlexible from "../middleware/authenticateFlexible.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// 🔐 Middleware global : seul un ADMIN peut gérer les rôles
router.use(authenticateFlexible, requireRole("ADMIN"));

/**
 * GET /api/roles
 * → Liste tous les rôles
 */
router.get("/", async (_req, res, next) => {
  try {
    const data = await roles.listRoles();
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/roles
 * → Crée un rôle
 */
router.post("/", validate(createRoleSchema), async (req, res, next) => {
  try {
    const data = await roles.createRole(req.body);
    res.setHeader("Cache-Control", "no-store");
    res.status(201).json({ success: true, data });
  } catch (e) {
    if (e.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, error: "Un rôle avec ce nom existe déjà" });
    }
    next(e);
  }
});

/**
 * GET /api/roles/:id
 * → Détail d’un rôle
 */
router.get("/:id", async (req, res, next) => {
  try {
    const data = await roles.getRole(req.params.id);
    if (!data) return next(new HttpError(404, "Role not found"));
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/roles/:id
 * → Met à jour un rôle
 */
router.patch("/:id", validate(updateRoleSchema), async (req, res, next) => {
  try {
    const data = await roles.updateRole(req.params.id, req.body);
    res.setHeader("Cache-Control", "no-store");
    res.json({ success: true, data });
  } catch (e) {
    if (e.code === "P2002") {
      return res
        .status(409)
        .json({ success: false, error: "Un rôle avec ce nom existe déjà" });
    }
    if (e.code === "P2025") {
      return res.status(404).json({ success: false, error: "Role not found" });
    }
    next(e);
  }
});

/**
 * DELETE /api/roles/:id
 * → Supprime un rôle
 */
router.delete("/:id", async (req, res, next) => {
  try {
    await roles.deleteRole(req.params.id);
    res.status(204).end();
  } catch (e) {
    if (e.code === "P2025") {
      return res.status(404).json({ success: false, error: "Role not found" });
    }
    if (e.code === "P2003") {
      return res.status(409).json({
        success: false,
        error:
          "Impossible de supprimer ce rôle car il est encore utilisé (utilisateurs ou permissions liés).",
      });
    }
    next(e);
  }
});

/**
 * POST /api/roles/:id/permissions
 * → Ajoute ou retire des permissions à un rôle
 */
router.post(
  "/:id/permissions",
  validate(updateRolePermissionsSchema),
  async (req, res, next) => {
    try {
      const { add = [], remove = [] } = req.body;
      const data = await roles.updateRolePermissions(
        req.params.id,
        add,
        remove
      );
      if (!data) return next(new HttpError(404, "Role not found"));
      res.setHeader("Cache-Control", "no-store");
      res.json({ success: true, data });
    } catch (e) {
      if (e.code === "P2025") {
        return res.status(404).json({ success: false, error: "Role not found" });
      }
      if (e.code === "P2003") {
        return res.status(409).json({
          success: false,
          error:
            "Impossible de modifier les permissions : des contraintes de clé étrangère empêchent l’opération.",
        });
      }
      next(e);
    }
  }
);

export default router;
