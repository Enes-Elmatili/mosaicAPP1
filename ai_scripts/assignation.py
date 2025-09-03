#!/usr/bin/env python3
# Script d’assignation automatique des missions de maintenance
import csv
import json
import math
import argparse
from pathlib import Path
from typing import List, Dict, Any, Union

# Constantes
EARTH_RADIUS_KM = 6371.0

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcule la distance en kilomètres entre deux points géographiques
    en utilisant la formule de haversine.
    
    Args:
        lat1 (float): Latitude du premier point.
        lon1 (float): Longitude du premier point.
        lat2 (float): Latitude du second point.
        lon2 (float): Longitude du second point.
        
    Returns:
        float: La distance en kilomètres.
    """
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return EARTH_RADIUS_KM * c

def load_providers(filepath: Union[str, Path]) -> List[Dict[str, Any]]:
    """
    Charge la liste des prestataires depuis un fichier CSV ou JSON.
    Gère les conversions de types pour les données numériques et booléennes.
    
    Args:
        filepath (Union[str, Path]): Le chemin vers le fichier de données.
        
    Returns:
        List[Dict[str, Any]]: Une liste de dictionnaires, chaque dictionnaire
                               représentant un prestataire.
    """
    providers = []
    file_path_obj = Path(filepath)
    
    if not file_path_obj.exists():
        raise FileNotFoundError(f"Le fichier {filepath} n'a pas été trouvé.")
        
    if file_path_obj.suffix.lower() == '.csv':
        with open(file_path_obj, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    providers.append({
                        'id': row.get('id'),
                        'nom': row.get('nom'),
                        'metiers': row.get('metiers', '').lower(),
                        'latitude': float(row.get('latitude', 0)),
                        'longitude': float(row.get('longitude', 0)),
                        'disponibilite': row.get('disponibilite', 'false').lower() in ('1', 'true', 'oui', 'yes'),
                    })
                except (ValueError, KeyError) as e:
                    print(f"Erreur de conversion de données pour la ligne: {row}. Erreur: {e}")
                    continue
    elif file_path_obj.suffix.lower() == '.json':
        with open(file_path_obj, encoding='utf-8') as f:
            data = json.load(f)
            for row in data:
                try:
                    providers.append({
                        'id': row.get('id'),
                        'nom': row.get('nom'),
                        'metiers': row.get('metiers', '').lower(),
                        'latitude': float(row.get('latitude', 0)),
                        'longitude': float(row.get('longitude', 0)),
                        'disponibilite': bool(row.get('disponibilite', False)),
                    })
                except (ValueError, KeyError) as e:
                    print(f"Erreur de conversion de données pour l'entrée JSON: {row}. Erreur: {e}")
                    continue
    else:
        raise ValueError("Le format de fichier doit être .csv ou .json.")
        
    return providers

def parse_args():
    """
    Parse les arguments en ligne de commande.
    
    Returns:
        argparse.Namespace: Les arguments parsés.
    """
    parser = argparse.ArgumentParser(
        description="Assignation d'une mission de maintenance au prestataire le plus proche."
    )
    parser.add_argument('metier', help="Métier recherché (ex: plomberie)")
    parser.add_argument('latitude', type=float, help="Latitude de la demande")
    parser.add_argument('longitude', type=float, help="Longitude de la demande")
    parser.add_argument('fichier', help="Fichier CSV ou JSON contenant les prestataires")
    parser.add_argument('--urgence', action='store_true', help="Marquer la demande comme urgente (optionnel)")
    return parser.parse_args()

def find_best_provider(providers: List[Dict[str, Any]], mission_lat: float, mission_lon: float, mission_metier: str) -> Union[Dict[str, Any], None]:
    """
    Trouve le prestataire le plus proche qui est disponible et qui correspond au métier demandé.
    
    Args:
        providers (List[Dict[str, Any]]): La liste de tous les prestataires.
        mission_lat (float): Latitude de la mission.
        mission_lon (float): Longitude de la mission.
        mission_metier (str): Le métier requis pour la mission.
        
    Returns:
        Union[Dict[str, Any], None]: Le meilleur prestataire trouvé ou None si aucun n'est disponible.
    """
    # Filtrer les prestataires disponibles et correspondant au métier demandé
    candidates = [
        p for p in providers
        if mission_metier.lower() in p.get('metiers', '').lower() and p.get('disponibilite')
    ]
    
    if not candidates:
        return None

    # Calculer la distance entre la demande et chaque candidat, puis sélectionner le plus proche
    best_provider = min(
        candidates,
        key=lambda p: haversine(
            mission_lat, mission_lon, p['latitude'], p['longitude']
        )
    )
    
    return best_provider

def main():
    """
    Fonction principale du script pour orchestrer l'assignation.
    """
    try:
        args = parse_args()
        providers = load_providers(args.fichier)
        
        best = find_best_provider(
            providers,
            args.latitude,
            args.longitude,
            args.metier
        )
        
        if best:
            print(f"Prestataire sélectionné: ID={best['id']} Nom={best['nom']}")
        else:
            print("Aucun prestataire disponible pour le métier demandé.")
            
    except FileNotFoundError as e:
        print(f"Erreur: {e}")
    except ValueError as e:
        print(f"Erreur de données: {e}")
    except Exception as e:
        print(f"Une erreur inattendue est survenue: {e}")

if __name__ == '__main__':
    main()
