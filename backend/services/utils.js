const ngeohash = require('ngeohash');
const { HttpError } = require('../middleware/httpError');

/**
 * Compute a geohash of precision 7 from latitude and longitude.
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */
function computeGeohash(lat, lng) {
  return ngeohash.encode(lat, lng, 7);
}

/**
 * Validate file mime type and size against env settings.
 * Throws HttpError(400 or 413) on invalid.
 * @param {import('multer').File} file
 */
function validateMimeAndSize(file) {
  const allowedMimes = (process.env.ALLOWED_MIME || 'image/jpeg,image/png').split(',');
  if (!allowedMimes.includes(file.mimetype)) {
    throw new HttpError(400, 'error.invalid_mime');
  }
  const maxMb = parseInt(process.env.MAX_UPLOAD_MB, 10) || 5;
  if (file.size > maxMb * 1024 * 1024) {
    throw new HttpError(413, 'error.file_too_large');
  }
}

module.exports = { computeGeohash, validateMimeAndSize };
