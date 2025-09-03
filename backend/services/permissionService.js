// backend/services/permissionService.js
import { prisma } from "../db/prisma.js";

/**
 * Liste toutes les permissions
 */
export async function listPermissions() {
  return prisma.permission.findMany();
}

/**
 * Récupère une permission par son ID
 * @param {string} id
 */
export async function getPermission(id) {
  return prisma.permission.findUnique({ where: { id } });
}

/**
 * Crée une permission
 * @param {{key:string, label:string, description?:string}} data
 */
export async function createPermission(data) {
  return prisma.permission.create({ data });
}

/**
 * Met à jour une permission
 * @param {string} id
 * @param {{key?:string, label?:string, description?:string}} data
 */
export async function updatePermission(id, data) {
  return prisma.permission.update({
    where: { id },
    data,
  });
}

/**
 * Supprime une permission
 * @param {string} id
 */
export async function deletePermission(id) {
  return prisma.permission.delete({ where: { id } });
}

/**
 * Export par défaut uniformisé
 */
export default {
  listPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
};
