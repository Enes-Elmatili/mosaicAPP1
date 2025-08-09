const { Router } = require('express');
const { validate } = require('../middleware/validate');
const { createRoleSchema, updateRolePermissionsSchema, updateRoleSchema } = require('../validation/role');
const roles = require('../services/roleService');
const { HttpError } = require('../middleware/httpError');

const router = Router();

router.get('/', async (_req, res) => {
  const data = await roles.listRoles();
  res.json(data);
});

router.post('/', validate(createRoleSchema), async (req, res, next) => {
  try {
    const data = await roles.createRole(req.body);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await roles.getRole(req.params.id);
    if (!data) return next(new HttpError(404, 'Role not found'));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validate(updateRoleSchema), async (req, res, next) => {
  try {
    const data = await roles.updateRole(req.params.id, req.body);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await roles.deleteRole(req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

router.post('/:id/permissions', validate(updateRolePermissionsSchema), async (req, res, next) => {
  try {
    const { add = [], remove = [] } = req.body;
    const data = await roles.updateRolePermissions(req.params.id, add, remove);
    if (!data) return next(new HttpError(404, 'Role not found'));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;

