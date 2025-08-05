export type Permission = {
  id: string;
  key: string;
  label: string;
  description?: string;
};

export type Role = {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
};
