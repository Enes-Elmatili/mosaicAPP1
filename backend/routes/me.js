const { Router } = require('express');
const { authenticate } = require('../middleware/authenticate');
const { prisma } = require('../db/prisma');
const { HttpError } = require('../middleware/httpError');

const router = Router();

/**
 * GET /api/me
 * Returns current user ID, roles and effectivePermissions.
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;
    // Fetch roles and their permissions
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: { include: { permissions: { include: { permission: true } } } },
      },
    });
    if (!userRoles) {
      throw new HttpError(401, 'User not found');
    }
    const roles = userRoles.map((ur) => ur.role.name);
    const permSet = new Set();
    userRoles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permSet.add(rp.permission.key);
      });
    });
    res.json({ id: userId, roles, effectivePermissions: Array.from(permSet) });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
