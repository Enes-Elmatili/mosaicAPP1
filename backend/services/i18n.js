const path = require('path');
const messages = require(path.join(__dirname, '../i18n/fr.json'));

/**
 * Simple translator that returns the message for a key or the key if missing.
 * @param {string} key
 * @returns {string}
 */
function t(key) {
  return messages[key] || key;
}

module.exports = { t };
