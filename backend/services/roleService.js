const { prisma } = require('../db/prisma');

function hydrate(role) {
  const permissions = role.permissions.map(rp => rp.permission);
  const { permissions: _join, ...rest } = role;
  return { ...rest, permissions };
}

async function listRoles() {
  const rows = await prisma.role.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { permissions: { include: { permission: true } } },
  });
  return rows.map(hydrate);
}

async function getRole(id) {
  const row = await prisma.role.findUnique({
    where: { id },
    include: { permissions: { include: { permission: true } } },
  });
  return row ? hydrate(row) : null;
}

async function createRole(input) {
  const row = await prisma.role.create({
    data: input,
    include: { permissions: { include: { permission: true } } },
  });
  return hydrate(row);
}

async function updateRole(id, input) {
  const row = await prisma.role.update({
    where: { id },
    data: input,
    include: { permissions: { include: { permission: true } } },
  });
  return hydrate(row);
}

async function deleteRole(id) {
  await prisma.role.delete({ where: { id } });
}

async function updateRolePermissions(id, add, remove) {
  if (remove.length) {
    await prisma.rolePermission.deleteMany({ where: { roleId: id, permissionId: { in: remove } } });
  }
  if (add.length) {
    await prisma.rolePermission.createMany({
      skipDuplicates: true,
      data: add.map(permissionId => ({ roleId: id, permissionId })),
    });
  }
  return getRole(id);
}

module.exports = {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  updateRolePermissions,
};
