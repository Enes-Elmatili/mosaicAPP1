#!/bin/bash
# ------------------------------------------------------------------
# Script de déploiement de l'application
# ------------------------------------------------------------------

set -e  # Quitter immédiatement en cas d'erreur

echo "=== Déploiement démarré: $(date) ==="

echo "1. Récupération du dernier code"
git pull

echo "2. Installation des dépendances Node.js"
npm install

if [ -d frontend ]; then
  echo "3. Construction du frontend"
  (cd frontend && npm install && npm run build)
else
  echo "3. Dossier 'frontend' non trouvé, build frontend ignoré"
fi

echo "4. Redémarrage du serveur backend"
# Option PM2 (défaut)
pm2 restart mosaic-backend
# Option systemd (alternative):
# systemctl restart mosaic-backend.service

echo "5. Vérification de l'état du service backend"
pm2 status mosaic-backend

echo "=== Déploiement terminé: $(date) ==="
