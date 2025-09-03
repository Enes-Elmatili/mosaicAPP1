// backend/middleware/errors.js (ESM)
import { Prisma } from '@prisma/client';
import { HttpError } from './httpError.js';

/**
 * Middleware de gestion centralisée des erreurs pour une API Express.
 * Capture et normalise différents types d'erreurs en une réponse JSON standardisée.
 */
export function errorHandler(err, req, res, _next) {
  const isProd = process.env.NODE_ENV === 'production';
  const requestId = req.id || res.getHeader('x-request-id');

  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal Server Error';
  let details = null;
  let meta;

  // 1) Erreurs applicatives explicites (générées par HttpError)
  if (err instanceof HttpError) {
    status = err.status;
    code = err.code || 'HTTP_ERROR';
    message = err.message;
    details = err.details ?? null;

  // 2) Erreurs connues de Prisma (e.g. violation de contrainte unique)
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        status = 409;
        code = 'PRISMA_P2002';
        message = 'Unique constraint violation';
        meta = err.meta;
        break;
      case 'P2025':
        status = 404;
        code = 'PRISMA_P2025';
        message = 'Record not found';
        meta = err.meta;
        break;
      case 'P2003':
        status = 409;
        code = 'PRISMA_P2003';
        message = 'Foreign key constraint failed';
        meta = err.meta;
        break;
      default:
        status = 400;
        code = `PRISMA_${err.code}`;
        message = err.message;
        meta = err.meta;
    }

  // 3) Erreurs de validation Prisma (e.g. mauvais type de données)
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    status = 400;
    code = 'PRISMA_VALIDATION';
    message = 'Invalid data for query';
    details = err.message;

  // 4) Erreurs de validation Zod/Yup
  } else if (err?.name === 'ZodError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation error';
    details = err.errors;

  // 5) JSON invalide (envoyé par le client)
  } else if (err instanceof SyntaxError && 'body' in err) {
    status = 400;
    code = 'BAD_JSON';
    message = 'Invalid JSON payload';

  // 6) Erreurs d'upload de fichiers (Multer)
  } else if (err?.name === 'MulterError') {
    status = 400;
    code = 'UPLOAD_ERROR';
    message = err.message;

  // 7) Erreurs d'authentification (JWT)
  } else if (err?.name === 'TokenExpiredError') {
    status = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Session expired';
  } else if (err?.name === 'JsonWebTokenError') {
    status = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid session';
  }

  // Log structuré pour l'analyse des erreurs
  const log = {
    t: new Date().toISOString(),
    id: requestId,
    status,
    code,
    msg: message,
    route: req.originalUrl,
    method: req.method,
    err: isProd ? undefined : (err.stack || String(err)),
  };
  console.error(JSON.stringify(log));

  // Réponse JSON standardisée envoyée au client
  const payload = {
    error: message,
    code,
    status,
    requestId,
    details,
    meta,
  };
  // Inclut la stack trace en mode dev pour le débogage
  if (!isProd && err.stack) {
    payload.stack = err.stack.split('\n').slice(0, 5);
  }

  return res.status(status).json(payload);
}
