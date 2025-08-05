import type { CurrentUser } from './types';

function matchPermission(key: string, candidate: string) {
  if (candidate === key) return true;
  // wildcard support: "tickets.*"
  if (candidate.endsWith('.*')) {
    const prefix = candidate.slice(0, -2);
    return key.startsWith(prefix + '.');
  }
  return false;
}

export function hasPermission(user: CurrentUser | null, needed: string) {
  if (!user) return false;
  return user.permissions.some(p => matchPermission(p.key, needed));
}

export function hasAnyPermission(user: CurrentUser | null, needed: string[]) {
  return needed.some(k => hasPermission(user, k));
}

export function hasAllPermissions(user: CurrentUser | null, needed: string[]) {
  return needed.every(k => hasPermission(user, k));
}

export function hasRole(user: CurrentUser | null, roleName: string) {
  if (!user) return false;
  return user.roles.some(r => r.name.toLowerCase() === roleName.toLowerCase());
}
