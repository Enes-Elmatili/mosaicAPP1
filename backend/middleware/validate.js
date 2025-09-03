// backend/middleware/validate.js (ESM)
import { HttpError } from "./httpError.js";

// Utilitaires pour cibler où valider
const pickers = {
  body: {
    get: (req) => req.body,
    set: (req, v) => (req.body = v),
  },
  query: {
    get: (req) => req.query,
    set: (req, v) => Object.assign(req.query, v), // ✅ correction: pas de réassignation
  },
  params: {
    get: (req) => req.params,
    set: (req, v) => (req.params = v),
  },
  headers: {
    get: (req) => req.headers,
    set: (_req, _v) => {}, // on ne réécrit pas les headers
  },
};

/**
 * Crée un middleware de validation pour un emplacement donné de la requête.
 * @param {any} schema - Le schéma Zod-like (doit avoir safeParse ou safeParseAsync).
 * @param {"body"|"query"|"params"|"headers"} where - L'emplacement de la requête à valider.
 */
export function validateAt(schema, where = "body") {
  if (!schema || typeof schema.safeParseAsync !== "function") {
    throw new Error("validateAt: schema must be un schéma Zod ou compatible");
  }
  const io = pickers[where];
  if (!io) throw new Error(`validateAt: unsupported location "${where}"`);

  return async (req, _res, next) => {
    try {
      const data = io.get(req);
      const result = await schema.safeParseAsync(data);

      if (!result.success) {
        const { fieldErrors, formErrors } = result.error.flatten();
        const issues = result.error.issues.map((i) => ({
          path: i.path.join("."),
          code: i.code,
          message: i.message,
        }));

        return next(
          HttpError.badRequest("Validation failed", {
            location: where,
            fieldErrors,
            formErrors,
            issues,
          })
        );
      }

      // Normalisation des données validées
      if (io.set) io.set(req, result.data);
      return next();
    } catch (e) {
      return next(e);
    }
  };
}

// Helpers ciblés
export const validateBody = (schema) => validateAt(schema, "body");
export const validateQuery = (schema) => validateAt(schema, "query");
export const validateParams = (schema) => validateAt(schema, "params");
export const validateHeaders = (schema) => validateAt(schema, "headers");

// Compatibilité : par défaut, on valide le body
export const validate = (schema) => validateBody(schema);

/**
 * Chaîne de middlewares pour valider plusieurs emplacements.
 * @param {{ body?: any, query?: any, params?: any, headers?: any }} schemas
 */
export function validateRequest({ body, query, params, headers } = {}) {
  const chain = [];
  if (params) chain.push(validateParams(params));
  if (query) chain.push(validateQuery(query));
  if (headers) chain.push(validateHeaders(headers));
  if (body) chain.push(validateBody(body));
  return chain;
}

export default {
  validateAt,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  validateRequest,
  validate,
};