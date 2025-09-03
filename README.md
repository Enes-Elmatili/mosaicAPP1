# MOSAÏC

**Note**: en développement, si la variable `JWT_SECRET` n'est pas définie, le backend utilisera la valeur de secours `dev_jwt_secret` pour signer et vérifier les JWT.

**Application web et mobile de gestion immobilière pour les MRE**

## Nettoyage des doublons (2025-08)

- Source d’auth unique: `src/context/AuthContext.tsx` gère login/logout et `/api/me`.
- Gardes de routes: `src/components/RequireAuth.tsx` et `src/components/RequirePermission.tsx` (désormais branché sur le contexte d’auth).
- Supprimés (doublons non utilisés):
  - `src/components/Auth/*` (anciens context/guards/RequireAuth)
  - `src/components/Unauthorized.tsx` (remplacé par `src/pages/common/UnauthorizedPage.tsx`)
  - Anciens composants JSX non utilisés: `src/components/{Accordion.jsx,Header.jsx,Footer.jsx,Layout.jsx,Hero.jsx,HowItWorks.jsx,Testimonials.jsx}`
  - Ancien store d’auth: `src/store/auth.ts` (confondait avec le contexte; garder `src/store/authStore.ts` pour tests master key)

Impact: le routage et les vérifications de permissions s’appuient désormais uniquement sur le contexte d’auth. Réduction des ambiguïtés et imports cohérents.

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

## Progressive Web App (PWA)

Cette application est configurée comme PWA via `vite-plugin-pwa`. Pour préparer, tester et déployer :

1. Placez vos fichiers d'icônes PWA dans le dossier `public/` :
   - `favicon.svg`
   - `icon-192.png`
   - `icon-512.png`
2. Générez le build de production :  
   ```bash
   npm run build
   ```
3. Prévisualisez le build localement :  
   ```bash
   npm run preview
   ```
4. Testez la conformité PWA avec l'audit Lighthouse de Chrome (Fonctionnalités offline, installabilité, performances…).

***⚠️ Trucs et astuces Dev / Cache***
- Si vos dernières modifications n'apparaissent pas en dev, désactivez le service worker :
  1. Ouvrez DevTools → Application → Service Workers → **Unregister**
  2. Dans DevTools → Application → Clear storage → cochez **Clear site data** puis **Clear**
  3. Rechargez la page en forçant (Ctrl+Shift+R / Cmd+Shift+R)
  4. Si nécessaire, relancez votre serveur de développement (stop & `npm run dev`)

5. Déployez le contenu du dossier `dist/` sur votre hébergement statique (Netlify, Vercel, GitHub Pages, etc.).

## Rapport d'état de l'application

Pour vérifier le bon fonctionnement global de l'application, exécutez les commandes suivantes :

### Vérification du code et des tests
```bash
npm run lint
npm test
```

### Génération et lancement de l'application
```bash
# Build frontend et backend
npm run build
npm run build:backend

# Lancement en local
npm run dev           # Frontend (port 4174)
npm run start:backend # Backend (port 3000)
```

### Rapport complet de l'état de l'application
```bash
npm run ci
```

## E2E & PWA & Docker

- E2E (Playwright)
  - Installer les navigateurs: `npm run e2e:install`
  - Lancer les tests: `npm run test:e2e` (rapport HTML dans `playwright-report`)

- PWA
  - Activer/désactiver via `VITE_ENABLE_PWA` (défaut: activé en build)
  - Fallback offline: `public/offline.html`

- Docker (dev rapide)
  - `docker compose up` (API: 3000, Web: 5173)
  - Front consomme l'API via `VITE_API_URL=http://localhost:3000/api`

**Synthèse**
- **État global**: Base fonctionnelle en place (frontend + backend), mais contra
ts API/UX encore désalignés. Lint et tests échouent actuellement. Estimation d’a
vancement MVP: ~60–70%.
- **Axes majeurs**: Backend riche (Express + Prisma + Stripe + mails + Socket.io
 + exports PDF/CSV), Frontend routé et structuré (React + Vite + PWA) mais formu
laires et services ne correspondent pas encore aux endpoints.

**Backend**
- **Serveur**: `express` + `helmet` + `cors`, routes sous `/api`, Swagger UI sur
 `/api/docs` (fichier `openapi.yaml`).
- **Domaines couverts**: demandes de maintenance (création, listage, détail), ch
angement de statut + historique (`StatusHistory`) avec export PDF/CSV, paiements
 Stripe (Checkout), notifications email (`nodemailer`), temps réel (`socket.io`)
, cron d’alertes.
- **Persistance**: Prisma avec SQLite (`prisma/dev.db`) et modèles clés: `Mainte
nanceRequest`, `StatusHistory`, `Alert`, `Request`/`RequestPhoto`, `Role`/`Permi
ssion`.
- **Sécurité**: JWT middleware avec fallback `JWT_SECRET` de dev, rate-limiting 
sur création de demande, validation `zod` (partielle).
- **Points à corriger**:
  - **Incohérences modèles**: usage mixte de `prisma.request` vs `prisma.mainten
anceRequest` dans `routes/requests.js` (détail/CRUD non unifiés).
  - **Fichiers statiques**: contrats PDF enregistrés sous `/contracts` mais non 
servis par Express (seule la base `/uploads` est exposée).
  - **Doublons mineurs**: imports/exports en double en fin de `routes/requests.j
s` et `notificationService.js`.
  - **OpenAPI**: schémas génériques et partiellement divergents du code (champs 
et chemins).

**Frontend**
- **Structure**: React + Vite + Tailwind + PWA, routage complet (public, tenant,
 owner, provider, admin) avec `Suspense` et garde `RequireAuth`/`RequirePermissi
on`.
- **Fonctionnalités**: pages squelettes (tableaux de bord, demandes, contrats, e
tc.), store d’auth simple via master key (`zustand`), composants UI de base, cli
ent Socket.io.
- **PWA**: `vite-plugin-pwa` configuré (manifest, cache images/API/static).
- **Services/API**: `src/lib/api.ts` consomme `VITE_API_URL` (défaut `http://loc
alhost:3000`) sans préfixe `/api`.
- **Points à corriger**:
  - **Contrat API**: `src/services/requests.ts` et types (`src/types/request.ts`
) attendent `title/priority/requester`, alors que l’API backend crée des `Mainte
nanceRequest` (ex. `propertyId`, `serviceType`, etc.). Les pages Tenant (ex: `Re
questsNewPage.tsx`) suivent le modèle frontend, pas celui du backend.
  - **Base URL**: PWA met en cache `^/api/`, mais `api.ts` appelle `http://local
host:3000` sans `/api`. Ajouter `/api` à `VITE_API_URL` ou au path.
  - **E2E vs UI**: test Playwright attend `categoryId/subcategoryId/photos`, abs
ents du formulaire actuel (mismatch).

**Base de données**
- **Schéma**: riche et proche du besoin (catégories/sous-catégories, géolocalisa
tion, historique statuts, alertes, rôles/permissions).
- **Migrations/seed**: présents, DB de dev (`sqlite`) en dépôt pour itérations r
apides.

**Qualité / Tests**
- **Lint**: échoue (config ESLint plate utilisant `tseslint.config()` incompatib
le avec la version actuelle).
- **Unit tests**: un test `authStore` existe; exécution `vitest` échoue (problèm
e ESM/CJS autour de `vite`/`vitest`).
- **E2E**: 1 spec Playwright ciblant le flux demandes + photos; risque d’échec c
ar le formulaire ne correspond pas (et backend auth JWT requise).
- **CI**: script `scripts/ci.sh` fait lint, test, build et un audit IA optionnel
 (via `src/ai-sandbox`).

**Sécurité / Config**
- **JWT**: fallback dev actif, OK pour dev, à surcharger en prod.
- **Stripe/SMTP**: dépend de variables `.env` non présentes (seul `VITE_MASTER_K
EY` détecté).
- **Uploads**: contrôle MIME/taille côté backend; chemin public `/uploads` confi
gurable, OK.

**Risques / Bloquants**
- **Désalignement Front/Back**: types, schémas et endpoints non synchronisés blo
quent l’intégration.
- **Base API**: absence de `/api` côté frontend/pwa empêche les appels et la str
atégie de cache prévue.
- **Livrables statiques**: contrats PDF non exposés publiquement.
- **Qualité**: lint/tests cassés, CI ne peut pas passer.
- **Env sensibles**: Stripe/SMTP requis pour paiements et emails.

**Prochaines Priorités (proposées)**
- **Aligner contrat API**: décider du modèle cible (Request vs MaintenanceReques
t) et unifier `routes/requests.js`, contrôleurs, types TS, pages Tenant.
- **Normaliser base URL**: définir `VITE_API_URL=http://localhost:3000/api` (ou 
préfixer les chemins dans `api.ts`) et aligner la config PWA.
- **Servir contrats**: exposer `/contracts` via `express.static` ou enregistrer 
sous `uploads/contracts` pour réutiliser la config existante.
- **Réparer lint/tests**: mettre à jour config ESLint (flat config compatible) e
t corriger le setup Vitest ESM; adapter le test E2E au formulaire réel ou vice v
ersa.
- **Auth de dev**: ajouter un mode dev côté backend acceptant la master key (ou 
stub JWT) pour permettre les E2E sans infra complète.
- **OpenAPI**: régénérer le spec depuis le code ou l’inverse, et activer l’explo
rateur pour QA.

**Variables d’environnement (exemples)**
- **Frontend**: `VITE_API_URL=http://localhost:3000/api`, `VITE_MASTER_KEY=...`
- **Backend**: `JWT_SECRET=...`, `SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_F
ROM`, `STRIPE_SECRET_KEY`, `SUCCESS_URL/CANCEL_URL`, `LOCAL_UPLOAD_DIR=uploads`,
 `PUBLIC_UPLOAD_BASE=/uploads`, `RATE_LIMIT_REQUESTS_PER_HOUR=5`, `MAX_UPLOAD_MB
=5`, `ADMIN_EMAILS=a@b,c@d`

Souhaitez-vous que j’aligne le frontend avec l’API (types, services et formulair
e des demandes) et que j’expose les contrats statiquement pour débloquer un parc
ours bout‑à‑bout en local ?

## Authentification (DEV et prod)

- Backend:
  - `POST /api/auth/login` avec `{ email, password }` (place un cookie `session`).
  - `GET /api/me` retourne `{ id, email, roles[], permissions[] }`.
  - Bypass DEV: si `x-master-key` correspond à `MASTER_KEY`/`VITE_MASTER_KEY`, le backend crée une session sans mot de passe.
- Frontend:
  - Contexte d’auth: `src/context/AuthContext.tsx` (fourni par `AuthProvider` dans `src/main.tsx`).
  - Gardes: `RequireAuth` vérifie l’auth, `RequirePermission` vérifie un rôle basique (tenant/owner/provider/admin).
  - Master key DEV: définir `VITE_MASTER_KEY=...` dans `.env`; certains écrans lisent `localStorage.mosaic_master_key` pour un accès simplifié en dev.

Bonnes pratiques:
- Utiliser uniquement `AuthContext` pour lire l’utilisateur et l’état de session.
- Éviter d’importer d’anciens helpers/contexts supprimés sous `src/components/Auth/*`.
- Pour le login UI, appeler `/api/auth/login` puis rafraîchir l’utilisateur via `/api/me`.
