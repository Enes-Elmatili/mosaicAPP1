// backend/middleware/httpError.js (ESM robuste)

/**
 * Codes HTTP standards → codes internes lisibles
 */
const STATUS_CODE = {
  400: "BAD_REQUEST",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "UNPROCESSABLE_ENTITY",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_ERROR",
};

/**
 * Classe d'erreur HTTP générique et robuste
 */
export class HttpError extends Error {
  /**
   * @param {number} status - Code HTTP (ex: 404)
   * @param {string} message - Message lisible
   * @param {{ code?: string, details?: any, cause?: any }=} opts
   */
  constructor(status, message, opts = {}) {
    super(message);

    this.name = "HttpError";
    this.status = Number.isInteger(status) ? status : 500;
    this.code = opts.code || STATUS_CODE[this.status] || "HTTP_ERROR";
    if (opts.details !== undefined) this.details = opts.details;
    if (opts.cause !== undefined) this.cause = opts.cause;

    // stack propre pour Node
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }

    // Propriétés énumérables utiles (log, JSON)
    Object.defineProperties(this, {
      name:   { value: this.name,   enumerable: true },
      status: { value: this.status, enumerable: true },
      code:   { value: this.code,   enumerable: true },
      message:{ value: this.message,enumerable: true },
      details:{ value: this.details,enumerable: true, writable: true },
    });
  }

  /**
   * Retour JSON propre (API friendly)
   */
  toJSON() {
    return {
      status: this.status,
      code: this.code,
      error: this.message,
      details: this.details ?? null,
    };
  }

  // ---------------------------
  // Helpers statiques pratiques
  // ---------------------------
  static badRequest(msg = "Bad Request", details) {
    return new HttpError(400, msg, { code: "BAD_REQUEST", details });
  }

  static unauthenticated(msg = "Unauthenticated", details) {
    return new HttpError(401, msg, { code: "UNAUTHENTICATED", details });
  }

  static forbidden(msg = "Forbidden", details) {
    return new HttpError(403, msg, { code: "FORBIDDEN", details });
  }

  static notFound(msg = "Not Found", details) {
    return new HttpError(404, msg, { code: "NOT_FOUND", details });
  }

  static conflict(msg = "Conflict", details) {
    return new HttpError(409, msg, { code: "CONFLICT", details });
  }

  static unprocessable(msg = "Unprocessable Entity", details) {
    return new HttpError(422, msg, { code: "UNPROCESSABLE_ENTITY", details });
  }

  static tooMany(msg = "Too Many Requests", details) {
    return new HttpError(429, msg, { code: "TOO_MANY_REQUESTS", details });
  }

  static internal(msg = "Internal Server Error", details) {
    return new HttpError(500, msg, { code: "INTERNAL_ERROR", details });
  }
}

/**
 * Petit type-guard pratique
 * @param {any} e
 * @returns {e is HttpError}
 */
export const isHttpError = (e) =>
  e instanceof HttpError ||
  (e && typeof e.status === "number" && typeof e.message === "string");

/**
 * Export par défaut → compatibilité
 */
export default HttpError;
