// backend/utils/utils.js
import ngeohash from 'ngeohash';
import { HttpError } from '../middleware/httpError.js';

/**
 * @name computeGeohash
 * @description Calcule un geohash de précision 7 à partir d'une latitude et d'une longitude.
 * @param {number} lat - La latitude.
 * @param {number} lng - La longitude.
 * @returns {string} - Le geohash calculé.
 */
export const computeGeohash = (lat, lng) => {
  return ngeohash.encode(lat, lng, 7);
};

/**
 * @name validateMimeAndSize
 * @description Valide le type MIME et la taille d'un fichier par rapport aux paramètres d'environnement.
 * @param {object} file - L'objet fichier (provenant de `multer`).
 * @returns {void}
 * @throws {HttpError} - Lance une erreur 400 si le type MIME est invalide ou 413 si la taille est trop grande.
 */
export const validateMimeAndSize = (file) => {
  const allowedMimes = (process.env.ALLOWED_MIME || 'image/jpeg,image/png').split(',').map(m => m.trim());
  if (!allowedMimes.includes(file.mimetype)) {
    throw new HttpError(400, 'error.invalid_mime');
  }

  const maxMb = parseInt(process.env.MAX_UPLOAD_MB, 10) || 5;
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new HttpError(413, 'error.file_too_large');
  }
};
