const { z } = require('zod');

const createRoleSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(256).optional(),
});

const updateRoleSchema = createRoleSchema.partial();

const updateRolePermissionsSchema = z.object({
  add: z.array(z.string().cuid()).optional().default([]),
  remove: z.array(z.string().cuid()).optional().default([]),
});

module.exports = { createRoleSchema, updateRoleSchema, updateRolePermissionsSchema };
