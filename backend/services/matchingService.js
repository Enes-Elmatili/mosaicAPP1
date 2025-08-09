// Service to match maintenance requests with providers

/**
 * Fictitious provider matching for MVP.
 * @param {object} requestData - Details of the maintenance request
 * @returns {Promise<object>} - Selected provider info
 */
async function findBestProvider(requestData) {
  // Dummy provider response for MVP
  return { id: 'provider123', name: 'Super Plombier', distanceKm: 2.3 };
}

module.exports = { findBestProvider };
