// backend/services/roleService.js
import { prisma } from "../db/prisma.js";

/**
 * Liste tous les rôles avec leurs permissions
 * @returns {Promise<Array>}
 */
export const getRoles = async () => {
  return prisma.role.findMany({
    include: {
      permissions: { include: { permission: true } }, // role.permissions => RolePermission[]
    },
  });
};

/**
 * Alias : listRoles → utilise getRoles
 */
export const listRoles = getRoles;

/**
 * Récupère un rôle par ID avec ses permissions
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const getRole = async (id) => {
  return prisma.role.findUnique({
    where: { id },
    include: {
      permissions: { include: { permission: true } },
    },
  });
};

/**
 * Crée un nouveau rôle
 * @param {{name:string, description?:string}} data
 * @returns {Promise<object>}
 */
export const createRole = async (data) => {
  try {
    return await prisma.role.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
    });
  } catch (e) {
    if (e.code === "P2002") {
      throw new Error("DUPLICATE_ROLE");
    }
    throw e;
  }
};

/**
 * Met à jour un rôle existant
 * @param {string} id
 * @param {{name?:string, description?:string}} data
 * @returns {Promise<object>}
 */
export const updateRole = async (id, data) => {
  try {
    return await prisma.role.update({
      where: { id },
      data,
    });
  } catch (e) {
    if (e.code === "P2025") {
      throw new Error("ROLE_NOT_FOUND");
    }
    if (e.code === "P2002") {
      throw new Error("DUPLICATE_ROLE");
    }
    throw e;
  }
};

/**
 * Supprime un rôle
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteRole = async (id) => {
  try {
    return await prisma.role.delete({
      where: { id },
    });
  } catch (e) {
    if (e.code === "P2025") {
      throw new Error("ROLE_NOT_FOUND");
    }
    if (e.code === "P2003") {
      throw new Error("ROLE_IN_USE");
    }
    throw e;
  }
};

/**
 * Met à jour les permissions d’un rôle
 * @param {string} roleId
 * @param {Array<string>} add - IDs de permissions à ajouter
 * @param {Array<string>} remove - IDs de permissions à retirer
 * @returns {Promise<object>}
 */
export const updateRolePermissions = async (roleId, add = [], remove = []) => {
  return prisma.$transaction(async (tx) => {
    // Vérif que le rôle existe
    const role = await tx.role.findUnique({ where: { id: roleId } });
    if (!role) throw new Error("ROLE_NOT_FOUND");

    // Ajouter les permissions
    if (add.length > 0) {
      await tx.rolePermission.createMany({
        data: add.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true, // évite les conflits si déjà lié
      });
    }

    // Retirer les permissions
    if (remove.length > 0) {
      await Promise.all(
        remove.map((permissionId) =>
          tx.rolePermission.delete({
            where: { roleId_permissionId: { roleId, permissionId } },
          }).catch((e) => {
            if (e.code !== "P2025") throw e; // ignore si déjà supprimé
          })
        )
      );
    }

    // Retourner le rôle avec permissions mises à jour
    return tx.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: { include: { permission: true } },
      },
    });
  });
};

/**
 * Liste les utilisateurs avec leurs rôles
 * @returns {Promise<Array>}
 */
export const getUsersWithRoles = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      userRoles: {
        select: {
          role: { select: { id: true, name: true, description: true } },
        },
      },
    },
  });
};

/**
 * Export par défaut
 */
export default {
  getRoles,
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
  getUsersWithRoles,
};
