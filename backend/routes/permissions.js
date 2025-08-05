const { Router } = require('express');
const { validate } = require('../middleware/validate');
const { createPermissionSchema, updatePermissionSchema } = require('../validation/permission');
const perms = require('../services/permissionService');
const { HttpError } = require('../middleware/httpError');

const router = Router();

router.get('/', async (_req, res) => {
  const data = await perms.listPermissions();
  res.json(data);
});

router.post('/', validate(createPermissionSchema), async (req, res, next) => {
  try {
    const data = await perms.createPermission(req.body);
    res.status(201).json(data);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await perms.getPermission(req.params.id);
    if (!data) return next(new HttpError(404, 'Permission not found'));
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', validate(updatePermissionSchema), async (req, res, next) => {
  try {
    const data = await perms.updatePermission(req.params.id, req.body);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await perms.deletePermission(req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
