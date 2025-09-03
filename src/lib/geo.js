// src/lib/geo.js
// ESM module – aucun package externe requis

/* ------------------ Constantes utiles ------------------ */
export const EARTH_RADIUS_KM = 6371;           // Rayon moyen de la Terre
export const KM_PER_DEG_LAT = 111.32;          // ~ km par degré de latitude

/* ------------------ Conversions ------------------ */
export const toRad = (deg) => (deg * Math.PI) / 180;
export const toDeg = (rad) => (rad * 180) / Math.PI;

/* ------------------ Distance (Haversine) ------------------ */
/**
 * Distance grand cercle (en kilomètres) entre deux points (lat/lng).
 */
export function haversineKm(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ------------------ Bounding box approx ------------------ */
/**
 * Calcule une bounding box approximative (minLat, maxLat, minLng, maxLng)
 * autour d’un centre et d’un rayon (km).
 * Utile pour un 1er filtre en SQLite (pas d’index géo natif).
 */
export function bboxFromCenter(lat, lng, radiusKm) {
  const dLat = radiusKm / KM_PER_DEG_LAT;
  const kmPerDegLon = KM_PER_DEG_LAT * Math.cos(toRad(lat));
  const dLon = radiusKm / Math.max(1e-6, kmPerDegLon); // éviter /0 aux pôles

  return {
    minLat: lat - dLat,
    maxLat: lat + dLat,
    minLng: lng - dLon,
    maxLng: lng + dLon,
  };
}

export function pointInBbox(lat, lng, bbox) {
  return (
    lat >= bbox.minLat &&
    lat <= bbox.maxLat &&
    lng >= bbox.minLng &&
    lng <= bbox.maxLng
  );
}

/* ------------------ Geohash (encode/décode + voisins) ------------------ */
/**
 * Geohash base32 (sans dépendance). Precision 1..12 (6–8 suffisent en pratique).
 * Inspiré de l’algorithme classique (public domain).
 */
const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function geohashEncode(lat, lng, precision = 7) {
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = "";

  let latMin = -90,  latMax = 90;
  let lonMin = -180, lonMax = 180;

  while (geohash.length < precision) {
    if (evenBit) {
      // longitudes
      const lonMid = (lonMin + lonMax) / 2;
      if (lng >= lonMid) {
        idx = (idx << 1) + 1;
        lonMin = lonMid;
      } else {
        idx = (idx << 1) + 0;
        lonMax = lonMid;
      }
    } else {
      // latitudes
      const latMid = (latMin + latMax) / 2;
      if (lat >= latMid) {
        idx = (idx << 1) + 1;
        latMin = latMid;
      } else {
        idx = (idx << 1) + 0;
        latMax = latMid;
      }
    }
    evenBit = !evenBit;

    if (++bit === 5) {
      geohash += BASE32.charAt(idx);
      bit = 0;
      idx = 0;
    }
  }
  return geohash;
}

export function geohashDecode(hash) {
  let evenBit = true;
  let latMin = -90,  latMax = 90;
  let lonMin = -180, lonMax = 180;

  for (const c of hash) {
    const idx = BASE32.indexOf(c);
    if (idx === -1) throw new Error(`Geohash contenant un caractère invalide: ${c}`);

    for (let n = 4; n >= 0; n--) {
      const bitN = (idx >> n) & 1;
      if (evenBit) {
        const lonMid = (lonMin + lonMax) / 2;
        if (bitN) lonMin = lonMid; else lonMax = lonMid;
      } else {
        const latMid = (latMin + latMax) / 2;
        if (bitN) latMin = latMid; else latMax = latMid;
      }
      evenBit = !evenBit;
    }
  }
  return {
    lat: (latMin + latMax) / 2,
    lng: (lonMin + lonMax) / 2,
    latErr: (latMax - latMin) / 2,
    lngErr: (lonMax - lonMin) / 2,
    bbox: { minLat: latMin, maxLat: latMax, minLng: lonMin, maxLng: lonMax },
  };
}

function geohashAdjacent(hash, dir) {
  // dir: {lat: -1|0|1, lng: -1|0|1}
  const d = geohashDecode(hash);
  const latSize = d.latErr * 2;
  const lngSize = d.lngErr * 2;
  const newLat = Math.min(90 - 1e-12, Math.max(-90 + 1e-12, d.lat + dir.lat * latSize));
  const newLngRaw = d.lng + dir.lng * lngSize;
  let newLng = newLngRaw;
  // normaliser longitude [-180,180]
  if (newLng > 180) newLng -= 360;
  if (newLng < -180) newLng += 360;
  return geohashEncode(newLat, newLng, hash.length);
}

export function geohashNeighbors(hash) {
  const dirs = [
    { lat:  1, lng:  0 }, // N
    { lat:  1, lng:  1 }, // NE
    { lat:  0, lng:  1 }, // E
    { lat: -1, lng:  1 }, // SE
    { lat: -1, lng:  0 }, // S
    { lat: -1, lng: -1 }, // SW
    { lat:  0, lng: -1 }, // W
    { lat:  1, lng: -1 }, // NW
  ];
  return dirs.map((dir) => geohashAdjacent(hash, dir));
}

/* ------------------ Helpers “métier” ------------------ */
/**
 * Filtre une collection d’objets {lat,lng,...} par rayon autour d’un centre,
 * renvoie enrichi avec distanceKm, trié du plus proche au plus loin.
 * Utile pour pré-trier côté Node quand tu es en SQLite.
 */
export function shortlistByRadius(items, centerLat, centerLng, radiusKm = 15) {
  const bbox = bboxFromCenter(centerLat, centerLng, radiusKm);
  const withinBbox = items.filter(
    (it) =>
      typeof it.lat === 'number' &&
      typeof it.lng === 'number' &&
      pointInBbox(it.lat, it.lng, bbox)
  );
  const enriched = withinBbox.map((it) => ({
    ...it,
    distanceKm: haversineKm(centerLat, centerLng, it.lat, it.lng),
  }));
  enriched.sort((a, b) => a.distanceKm - b.distanceKm);
  return enriched.filter((x) => x.distanceKm <= radiusKm);
}

/**
 * Construit les champs géo (geohash + bbox approx) au moment où tu crées une Request.
 */
export function buildGeoFieldsForRequest(lat, lng, { geohashPrecision = 7, radiusKmIndex = 10 } = {}) {
  const geohash = geohashEncode(lat, lng, geohashPrecision);
  const bbox = bboxFromCenter(lat, lng, radiusKmIndex);
  return { geohash, bbox };
}

/**
 * Fournit la bounding box SQL-friendly pour un WHERE en SQLite.
 * Exemple d’utilisation:
 *   const {minLat,maxLat,minLng,maxLng} = sqlBbox(33.57,-7.58,15);
 *   ... WHERE lat BETWEEN minLat AND maxLat AND lng BETWEEN minLng AND maxLng
 */
export function sqlBbox(centerLat, centerLng, radiusKm) {
  return bboxFromCenter(centerLat, centerLng, radiusKm);
}

/**
 * Calcule la distance pour chaque provider (objet) et renvoie trié par distance.
 * (syntaxe identique à shortlistByRadius mais sans filtre rayon)
 */
export function attachDistanceAndSort(items, centerLat, centerLng) {
  const out = items.map((it) => ({
    ...it,
    distanceKm:
      typeof it.lat === 'number' && typeof it.lng === 'number'
        ? haversineKm(centerLat, centerLng, it.lat, it.lng)
        : Number.POSITIVE_INFINITY,
  }));
  out.sort((a, b) => a.distanceKm - b.distanceKm);
  return out;
}
