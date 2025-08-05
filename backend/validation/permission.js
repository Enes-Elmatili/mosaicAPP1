const { z } = require('zod');

const createPermissionSchema = z.object({
  key: z.string().min(2).max(128).regex(/^[a-z0-9_.:-]+$/i),
  label: z.string().min(2).max(128),
  description: z.string().max(256).optional(),
});

const updatePermissionSchema = createPermissionSchema.partial();

module.exports = { createPermissionSchema, updatePermissionSchema };
