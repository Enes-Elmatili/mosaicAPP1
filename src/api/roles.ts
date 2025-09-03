// frontend/api/rolePermission.ts
import type { Role, Permission } from '../types/role';
import { http } from '../utils/http';

/**
 * @namespace RolesAPI
 * @description Fonctions d'API pour interagir avec les endpoints des rôles.
 */
export const RolesAPI = {
  /**
   * Récupère la liste de tous les rôles.
   * @returns {Promise<Role[]>} Une promesse qui résout vers un tableau de rôles.
   */
  list: () => http<Role[]>('/api/roles'),

  /**
   * Récupère un rôle par son ID.
   * @param {string} id - L'ID du rôle.
   * @returns {Promise<Role>} Une promesse qui résout vers l'objet rôle.
   */
  get: (id: string) => http<Role>(`/api/roles/${id}`),

  /**
   * Crée un nouveau rôle.
   * @param {Pick<Role, 'name' | 'description'>} payload - Les données du nouveau rôle.
   * @returns {Promise<Role>} Une promesse qui résout vers le rôle nouvellement créé.
   */
  create: (payload: Pick<Role, 'name' | 'description'>) =>
    http<Role>('/api/roles', { method: 'POST', body: JSON.stringify(payload) }),

  /**
   * Met à jour un rôle existant par son ID.
   * Utilise la méthode 'PUT' pour une mise à jour complète de la ressource.
   * @param {string} id - L'ID du rôle à mettre à jour.
   * @param {Partial<Pick<Role, 'name' | 'description'>>} payload - Les données à mettre à jour.
   * @returns {Promise<Role>} Une promesse qui résout vers l'objet rôle mis à jour.
   */
  update: (id: string, payload: Partial<Pick<Role, 'name' | 'description'>>) =>
    http<Role>(`/api/roles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  /**
   * Supprime un rôle par son ID.
   * Utilise la fonction utilitaire `http` pour une gestion des erreurs uniforme.
   * @param {string} id - L'ID du rôle à supprimer.
   * @returns {Promise<void>} Une promesse qui se résout une fois la suppression réussie.
   */
  remove: (id: string) =>
    http<void>(`/api/roles/${id}`, { method: 'DELETE' }),

  /**
   * Met à jour les permissions d'un rôle.
   * Utilise la méthode 'PATCH' pour une mise à jour partielle des permissions.
   * @param {string} id - L'ID du rôle.
   * @param {string[]} add - Liste des IDs de permissions à ajouter.
   * @param {string[]} remove - Liste des IDs de permissions à supprimer.
   * @returns {Promise<Role>} Une promesse qui résout vers le rôle mis à jour.
   */
  updatePermissions: (id: string, add: string[], remove: string[]) =>
    http<Role>(`/api/roles/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ add, remove }),
    }),
};

/**
 * @namespace PermissionsAPI
 * @description Fonctions d'API pour interagir avec les endpoints des permissions.
 */
export const PermissionsAPI = {
  /**
   * Récupère la liste de toutes les permissions.
   * @returns {Promise<Permission[]>} Une promesse qui résout vers un tableau de permissions.
   */
  list: () => http<Permission[]>('/api/permissions'),

  /**
   * Crée une nouvelle permission.
   * @param {Pick<Permission, 'key' | 'label' | 'description'>} payload - Les données de la nouvelle permission.
   * @returns {Promise<Permission>} Une promesse qui résout vers la permission nouvellement créée.
   */
  create: (payload: Pick<Permission, 'key' | 'label' | 'description'>) =>
    http<Permission>('/api/permissions', { method: 'POST', body: JSON.stringify(payload) }),
};
