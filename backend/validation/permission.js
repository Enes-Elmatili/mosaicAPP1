// backend/validation/permission.js
import { z } from "zod";

/**
 * @description Schéma générique d'ID
 * - Accepte UUID v4 (36 caractères avec tirets)
 * - Accepte CUID (commence par 'c' + alphanumérique)
 */
export const idSchema = z
  .string()
  .refine(
    (val) =>
      /^[0-9a-fA-F-]{36}$/.test(val) || /^c[a-z0-9]{24,}$/.test(val),
    {
      message: "L'ID doit être un UUID ou un CUID valide",
    }
  );

/**
 * @description Schéma de validation pour la création d'une permission.
 * - 'key': Chaîne de caractères requise, avec une longueur entre 2 et 128 caractères.
 *    Doit correspondre à un format de clé (a-z, 0-9, _, ., :, -).
 * - 'label': Chaîne de caractères requise, avec une longueur entre 2 et 128 caractères.
 * - 'description': Chaîne de caractères optionnelle, max 256.
 */
export const createPermissionSchema = z.object({
  key: z
    .string()
    .min(2, "La clé doit contenir au moins 2 caractères")
    .max(128, "La clé ne peut pas dépasser 128 caractères")
    .regex(/^[a-z0-9_.:-]+$/i, "La clé contient des caractères non autorisés."),
  label: z
    .string()
    .min(2, "Le label doit contenir au moins 2 caractères")
    .max(128, "Le label est trop long."),
  description: z
    .string()
    .max(256, "La description est trop longue.")
    .optional(),
});

/**
 * @description Schéma de validation pour la mise à jour d'une permission.
 * Tous les champs deviennent optionnels.
 */
export const updatePermissionSchema = createPermissionSchema.partial();

/**
 * @description Schéma de validation pour les params :id
 */
export const permissionIdParamSchema = z.object({
  id: idSchema,
});

/**
 * Export par défaut
 */
export default {
  idSchema,
  createPermissionSchema,
  updatePermissionSchema,
  permissionIdParamSchema,
};