// backend/validation/role.js
import { z } from "zod";

/**
 * Utilitaire pour valider un ID (UUID ou CUID)
 * - UUID v4 : 36 caractères avec tirets
 * - CUID : commence par 'c' + alphanumérique
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
 * Schéma création de rôle
 * - name : requis (2-64 caractères)
 * - description : optionnelle (max 256 caractères)
 */
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom du rôle doit contenir au moins 2 caractères")
    .max(64, "Le nom du rôle ne peut pas dépasser 64 caractères")
    .trim(),
  description: z
    .string()
    .max(256, "La description ne peut pas dépasser 256 caractères")
    .optional(),
});

/**
 * Schéma mise à jour de rôle
 * - tous les champs sont optionnels
 */
export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom du rôle doit contenir au moins 2 caractères")
    .max(64, "Le nom du rôle ne peut pas dépasser 64 caractères")
    .trim()
    .optional(),
  description: z
    .string()
    .max(256, "La description ne peut pas dépasser 256 caractères")
    .optional(),
});

/**
 * Schéma mise à jour des permissions d’un rôle
 * - add : liste d’IDs de permissions à ajouter
 * - remove : liste d’IDs de permissions à retirer
 */
export const updateRolePermissionsSchema = z.object({
  add: z.array(idSchema).optional().default([]),
  remove: z.array(idSchema).optional().default([]),
});

/**
 * Schéma lecture d’un rôle
 * (utile si tu veux valider les params :id dans les routes)
 */
export const roleIdParamSchema = z.object({
  id: idSchema,
});

/**
 * Export par défaut
 */
export default {
  idSchema,
  createRoleSchema,
  updateRoleSchema,
  updateRolePermissionsSchema,
  roleIdParamSchema,
};
