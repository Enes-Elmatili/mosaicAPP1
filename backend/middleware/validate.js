const { ZodSchema } = require('zod');
const { HttpError } = require('./httpError');

/**
 * Validate request body against given Zod schema.
 */
function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new HttpError(400, 'Validation failed', result.error.flatten()));
    }
    req.body = result.data;
    return next();
  };
}

module.exports = { validate };
