# Documentation Fonctionnelle

## Objectifs Métier
- Gestion des abonnements, contrats et paiements
- Suivi des biens et reporting propriétaire
- Interface back‑office pour assignation et KPI

## Parcours Utilisateur
1. Inscription / Authentification (Firebase Auth)
2. Abonnement via Stripe
3. Authentification et accès au dashboard
   - **Admin** : connexion par email mocké (`enes.elmatili@outlook.com`).
   - **Tenant/Owner** : connexion via master key (côté back‑end).
   - Vue « Tableau de bord locataire » affichant :
     - Statistiques globales (nombre total de demandes, en attente, autres statuts)
     - Liens vers création et liste des demandes
     - Aperçu des 5 dernières demandes avec lien vers détails
4. Page d'accueil de l'app (après login)
   - Hero court (titre + sous-titre + CTA unique).
   - Actions rapides : Nouvelle demande, Mes demandes, Paramètres.
   - Dernières demandes : liste avec états loading / empty / error.

5. Consultation des contrats et tickets
5. Notifications push / email

---
