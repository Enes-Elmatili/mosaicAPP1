const { Prisma } = require('@prisma/client');
const { HttpError } = require('./httpError');

/**
 * Express error handling middleware.
 */
function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details ?? null });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Unique constraint violation', meta: err.meta });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found', meta: err.meta });
    }
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = { errorHandler };
