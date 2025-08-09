/**
 * Configuration du client Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Lecture des variables d'environnement pour Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Vérifier que les variables sont définies
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Les variables d’environnement SUPABASE_URL et SUPABASE_KEY doivent être définies'
  );
}

// Initialisation du client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Export du client configuré pour l'utiliser dans tout le projet
module.exports = supabase;

/*
Exemple d’utilisation:
(async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  if (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
  } else {
    console.log('Liste des utilisateurs:', data);
  }
})();
*/
