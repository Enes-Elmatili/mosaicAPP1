export type RoleRef = { name: string };
export type PermissionRef = { key: string };

export type CurrentUser = {
  id: string;
  email?: string;
  roles: RoleRef[];
  permissions: PermissionRef[];
};
