#!/usr/bin/env python3
# Script de génération automatique de contrats de service.
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

def generate_contract_text(data: Dict[str, Any]) -> str:
    """
    Génère le texte d'un contrat de service à partir d'un dictionnaire de données.
    
    Args:
        data (Dict[str, Any]): Un dictionnaire contenant les données du contrat.
        
    Returns:
        str: Le texte complet du contrat.
    """
    # Utilisation d'une f-string multiligne comme modèle de contrat
    contract_template = f"""
CONTRAT DE PRESTATION DE SERVICES
====================================

Entre les soussignés :

La Société Prestataire :
[Nom de la société]
[Adresse de la société]
Représentée par : [Nom du représentant]

Et le Client :
Nom : {data['client_name']}
Adresse : {data['client_address']}

Date du Contrat : {data['start_date'].strftime('%d/%m/%Y')}

Article 1 : Objet du Contrat
-----------------------------
Le présent contrat a pour objet la prestation de services de {data['service_type']}
par la Société Prestataire au Client.

Article 2 : Description des Services
------------------------------------
Les services incluent :
- Une intervention de {data['service_type']}
- Un diagnostic et une réparation si nécessaire.
- ... (autres détails)

Article 3 : Prix et Conditions de Paiement
--------------------------------------------
Le montant total de la prestation s'élève à {data['price']} EUR.
Le paiement s'effectuera par {data['payment_terms']}.

Article 4 : Durée du Contrat
------------------------------
Ce contrat prend effet le {data['start_date'].strftime('%d/%m/%Y')} pour une durée de {data['duration']} mois.

Fait à [Lieu], le {data['generation_date'].strftime('%d/%m/%Y')}
En deux exemplaires.

Pour la Société Prestataire,
[Signature]

Pour le Client,
{data['client_name']}
[Signature]
"""
    return contract_template

def save_contract(contract_text: str, client_name: str) -> Path:
    """
    Sauvegarde le texte du contrat dans un fichier .txt.
    Le nom du fichier est généré à partir du nom du client et de la date.
    
    Args:
        contract_text (str): Le contenu du contrat à sauvegarder.
        client_name (str): Le nom du client pour le nommage du fichier.
        
    Returns:
        Path: Le chemin complet du fichier sauvegardé.
    """
    # Nettoyer le nom du client pour l'utiliser dans le nom de fichier
    filename = f"contrat_{client_name.replace(' ', '_').lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    filepath = Path(f"./contrats/{filename}")
    
    # Créer le dossier 'contrats' s'il n'existe pas
    filepath.parent.mkdir(parents=True, exist_ok=True)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(contract_text)
        
    return filepath

def parse_args():
    """
    Parse les arguments en ligne de commande pour le contrat.
    
    Returns:
        argparse.Namespace: Les arguments parsés.
    """
    parser = argparse.ArgumentParser(
        description="Génération d'un contrat de service à partir d'arguments."
    )
    parser.add_argument('client_name', help="Nom complet du client.")
    parser.add_argument('client_address', help="Adresse du client.")
    parser.add_argument('service_type', help="Type de service (ex: 'plomberie').")
    parser.add_argument('price', type=float, help="Prix de la prestation en EUR.")
    parser.add_argument('--start-date', type=str, default=datetime.now().strftime('%Y-%m-%d'),
                        help="Date de début du contrat (format YYYY-MM-DD).")
    parser.add_argument('--duration', type=int, default=1,
                        help="Durée du contrat en mois.")
    parser.add_argument('--payment-terms', type=str, default="virement bancaire",
                        help="Termes de paiement.")
    return parser.parse_args()

def main():
    """
    Fonction principale du script pour orchestrer la génération du contrat.
    """
    try:
        args = parse_args()
        
        # Préparation des données du contrat
        contract_data = {
            'client_name': args.client_name,
            'client_address': args.client_address,
            'service_type': args.service_type,
            'price': args.price,
            'start_date': datetime.strptime(args.start_date, '%Y-%m-%d'),
            'duration': args.duration,
            'payment_terms': args.payment_terms,
            'generation_date': datetime.now(),
        }
        
        # Générer le texte du contrat
        contract_text = generate_contract_text(contract_data)
        
        # Sauvegarder le contrat dans un fichier
        filepath = save_contract(contract_text, contract_data['client_name'])
        
        print(f"Contrat généré avec succès et sauvegardé ici : {filepath}")
        
    except FileNotFoundError as e:
        print(f"Erreur: {e}")
    except ValueError as e:
        print(f"Erreur de données ou de format de date: {e}")
    except Exception as e:
        print(f"Une erreur inattendue est survenue: {e}")

if __name__ == '__main__':
    main()
