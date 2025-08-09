#!/bin/bash
# ------------------------------------------------------------------
# Script de vérification de la santé des endpoints de l'API
# ------------------------------------------------------------------

set -e

# Liste des endpoints à tester : méthode et URL
declare -a endpoints=(
  "GET /"
  "GET /requests"
  "GET /requests/1/status-history"
  "GET /payments"
  "GET /contracts"
)

BASE_URL="http://localhost:3000"

echo "=== Démarrage des health checks API ($(date)) ==="

for entry in "${endpoints[@]}"; do
  # Séparer la méthode et le chemin
  method="${entry%% *}"
  path="${entry#* }"

  # Exécuter la requête curl silencieuse, récupérer le code HTTP
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X "$method" "$BASE_URL$path")

  # Vérifier le code et afficher OK ou FAIL
  if [[ "$http_code" =~ ^(200|201)$ ]]; then
    echo "[OK]   $method $path -> $http_code"
  else
    echo "[FAIL] $method $path -> $http_code"
  fi
done

echo "=== Health checks terminés ($(date)) ==="
