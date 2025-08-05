# MOSAÏC

**Application web et mobile de gestion immobilière pour les MRE**

## Architecture générale

Le projet MOSAÏC s'articule autour de plusieurs modules indépendants :

```
MOSAÏC/
├─ frontend/           # Application React PWA pour utilisateurs (clients, locataires, propriétaires)
│  ├─ App.js           # Point d'entrée React
│  ├─ pages/           # Pages fonctionnelles (home, abonnement, tableau de bord…)
│  ├─ services/        # Appels API (auth, paiement, notifications)
│  └─ styles/          # Fichiers CSS / Tailwind
│
├─ backend/            # Serveur Node.js + Express (ou NestJS)
│  ├─ app.js           # Initialisation globale Express
│  ├─ server.js        # Démarrage serveur (port 3000)
  ├─ routes/          # Définition des routes HTTP
  ├─ controllers/     # Logique métier des endpoints
  └─ services/        # Services externes (Stripe, Supabase, Firebase, OpenAI…)
│
├─ ai_scripts/         # Scripts Python d’automatisation et IA
│  ├─ assignation.py
  ├─ contract_gen.py
  └─ predictive.py
│
├─ database/           # Configuration migrations & seeds (PostgreSQL / Supabase)
│  ├─ config.js
  ├─ migrations/
  └─ seeds/
│
├─ documentation/      # Spécifications fonctionnelles et techniques
│  ├─ functional.md
  └─ technical.md
│
├─ designs/            # Diagrammes & maquettes (flowcharts)
│  └─ flowcharts.md
│
├─ scripts/            # Scripts utilitaires (déploiement, tests…)
│  ├─ deploy.sh
  └─ test.sh
│
└─ .gitignore

```

## Stack technique

- **Frontend** : React.js (PWA) + TailwindCSS
- **Backend** : Node.js + Express vs NestJS + PostgreSQL (Supabase)
- **Auth** : Firebase Auth & JWT
- **Notifications** : Web Push + Firebase Messaging + Email SMTP
- **Paiement** : Stripe
- **IA & automatisation** : Python + OpenAI API
- **Stockage** : Supabase Storage ou AWS S3

## Fonctionnalités MVP

1. Abonnement & paiement Stripe
2. Tableau de bord sécurisé (contrats, tickets, paiements)
3. Interface propriétaire (reporting rentabilité)
4. Back‑office pour assignation, suivi IA & KPI
5. Notifications push & email
6. Génération automatique de contrats et rapports
7. Analyse prédictive via IA

---

_Généré automatiquement le `$(date +"%Y-%m-%d")`_
