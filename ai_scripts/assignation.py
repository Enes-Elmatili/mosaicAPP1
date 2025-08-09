#!/usr/bin/env python3
# Script d’assignation automatique des tâches
import csv
import json
import math
import argparse

def haversine(lat1, lon1, lat2, lon2):
    """Calcule la distance en kilomètres entre deux points géographiques."""
    R = 6371.0  # Rayon de la Terre en kilomètres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))

def load_providers(filepath):
    """Charge la liste des prestataires depuis un fichier CSV ou JSON."""
    providers = []
    if filepath.lower().endswith('.csv'):
        with open(filepath, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Conversion des champs numériques et booléens
                row['latitude'] = float(row['latitude'])
                row['longitude'] = float(row['longitude'])
                row['disponibilite'] = row['disponibilite'].lower() in ('1', 'true', 'oui', 'yes')
                providers.append(row)
    else:
        with open(filepath, encoding='utf-8') as f:
            data = json.load(f)
            for row in data:
                # Conversion des champs numériques et booléens
                row['latitude'] = float(row['latitude'])
                row['longitude'] = float(row['longitude'])
                row['disponibilite'] = bool(row.get('disponibilite', False))
                providers.append(row)
    return providers

def parse_args():
    """Parse les arguments en ligne de commande."""
    parser = argparse.ArgumentParser(
        description="Assignation d'une mission de maintenance au prestataire le plus proche."
    )
    parser.add_argument('metier', help="Métier recherché")
    parser.add_argument('latitude', type=float, help="Latitude de la demande")
    parser.add_argument('longitude', type=float, help="Longitude de la demande")
    parser.add_argument('fichier', help="Fichier CSV ou JSON contenant les prestataires")
    parser.add_argument('--urgence', action='store_true', help="Marquer la demande comme urgente (optionnel)")
    return parser.parse_args()

def main():
    # Lecture des arguments
    args = parse_args()

    # Chargement des prestataires
    providers = load_providers(args.fichier)

    # Filtrer les prestataires disponibles et correspondant au métier demandé
    candidates = [
        p for p in providers
        if args.metier.lower() in p.get('metiers', '').lower() and p.get('disponibilite')
    ]
    if not candidates:
        print("Aucun prestataire disponible pour le métier demandé.")
        return

    # Calculer la distance entre la demande et chaque candidat, puis sélectionner le plus proche
    best = min(
        candidates,
        key=lambda p: haversine(
            args.latitude, args.longitude, p['latitude'], p['longitude']
        )
    )

    # Affichage du prestataire sélectionné
    print(f"Prestataire sélectionné: ID={best['id']} Nom={best['nom']}")

if __name__ == '__main__':
    main()
