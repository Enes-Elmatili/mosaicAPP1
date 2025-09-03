// backend/services/i18n.js
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let messages = {};
try {
  // Le chemin est relatif à ce fichier
  messages = await import(path.join(__dirname, '../i18n/fr.json'), {
    assert: { type: 'json' }
  });
  messages = messages.default;
} catch (e) {
  console.error('Erreur lors du chargement du fichier de traduction (fr.json):', e);
  console.error('Les clés de traduction ne seront pas trouvées.');
}

/**
 * @name t
 * @description Un simple traducteur qui retourne la traduction pour une clé donnée,
 * ou la clé elle-même si aucune traduction n'est trouvée.
 * @param {string} key - La clé de traduction.
 * @returns {string} - Le message traduit ou la clé originale.
 */
export const t = (key) => {
  return messages[key] || key;
};
