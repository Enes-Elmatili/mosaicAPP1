const { prisma } = require('../db/prisma');

function listPermissions() {
  return prisma.permission.findMany({ orderBy: { key: 'asc' } });
}

function getPermission(id) {
  return prisma.permission.findUnique({ where: { id } });
}

function createPermission(input) {
  return prisma.permission.create({ data: input });
}

function updatePermission(id, input) {
  return prisma.permission.update({ where: { id }, data: input });
}

function deletePermission(id) {
  return prisma.permission.delete({ where: { id } });
}

module.exports = {
  listPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
};
