// backend/utils/cache.js

/**
 * Petit cache en mémoire basé sur Map.
 * ⚠️ Attention : ce cache est en mémoire du process Node.
 * - Il est perdu si le serveur redémarre.
 * - Si tu scales sur plusieurs instances, il faut Redis ou Memcached.
 *
 * Usage typique :
 *   setCache("providers-top", data, 5000);
 *   const cached = getCache("providers-top");
 *   invalidateCache("providers-top");
 *   invalidateAll();
 */

/**
 * @typedef {Object} CacheEntry
 * @property {any} data - Les données stockées
 * @property {number} expiresAt - Timestamp d’expiration en ms
 */

const store = new Map();
const DEFAULT_TTL = 5000; // 5s par défaut
const DEBUG = process.env.NODE_ENV !== "production"; // log en dev uniquement

/**
 * Génère une clé normalisée (utile pour éviter collisions).
 * @param {string} key
 * @returns {string}
 */
function normalizeKey(key) {
  return key.trim().toLowerCase();
}

/**
 * Récupère une valeur du cache si encore valide.
 * @param {string} key
 * @returns {any|null}
 */
export function getCache(key) {
  const norm = normalizeKey(key);
  const entry = store.get(norm);

  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(norm);
    if (DEBUG) console.log(`[CACHE] Expired key: ${norm}`);
    return null;
  }
  if (DEBUG) console.log(`[CACHE] Hit: ${norm}`);
  return entry.data;
}

/**
 * Stocke une valeur dans le cache.
 * @param {string} key
 * @param {any} data
 * @param {number} [ttlMs=DEFAULT_TTL]
 */
export function setCache(key, data, ttlMs = DEFAULT_TTL) {
  const norm = normalizeKey(key);
  const expiresAt = Date.now() + ttlMs;
  store.set(norm, { data, expiresAt });
  if (DEBUG) console.log(`[CACHE] Set: ${norm} (ttl=${ttlMs}ms)`);
}

/**
 * Invalide une clé spécifique.
 * @param {string} key
 */
export function invalidateCache(key) {
  const norm = normalizeKey(key);
  store.delete(norm);
  if (DEBUG) console.log(`[CACHE] Invalidate key: ${norm}`);
}

/**
 * Vide tout le cache.
 */
export function invalidateAll() {
  store.clear();
  if (DEBUG) console.log(`[CACHE] Cleared all`);
}
