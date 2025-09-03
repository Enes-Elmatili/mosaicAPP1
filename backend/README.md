# 📌 MOSAIC API — Documentation des routes

Backend Node.js / Express avec Prisma + Socket.IO  
Toutes les routes sont préfixées par `/api`.

---

## 🚑 Healthcheck & Système

- `GET /api/` → statut API (`{ status, ts }`)
- `GET /api/health` → `{ status: "ok", uptime }`
- `HEAD /api/health`

---

## 👤 Authentification & Utilisateurs

- `POST /api/auth/login` → login (JWT) ◊ 
- `POST /api/auth/signup` → inscription ◊
- `POST /api/auth/refresh` → refresh token ◊
- `POST /api/auth/logout` ◊ 

- `GET /api/me` → infos de l’utilisateur courant◊
- `GET /api/users` → liste utilisateurs◊
- `GET /api/users/:id` → détail utilisateur ◊
- `POST /api/users` → créer utilisateur ◊
- `PATCH /api/users/:id` → update utilisateur* ◊
- `DELETE /api/users/:id` → supprimer utilisateur * ◊

---

## 🔑 RBAC : Rôles & Permissions

- `GET /api/roles` → liste des rôles ◊
- `POST /api/roles` → créer un rôle ◊
- `GET /api/roles/:id` → détail rôle ◊
- `PATCH /api/roles/:id` → update rôle ◊
- `DELETE /api/roles/:id` ◊ 

- `GET /api/permissions` → liste des permissions ◊
- `POST /api/permissions` → créer une permission ◊
- `GET /api/permissions/:id` → détail permission ◊
- `PATCH /api/permissions/:id` → update permission ◊
- `DELETE /api/permissions/:id` ◊
cmeys8otx0000ks0hwe0skwmd
--- 

## 📊 Statistiques & Export

- `GET /api/stats` → statistiques globales ◊
- 'GET /api/stats/requests.csv' → export CSV/Excel ◊
-  /api/export/requests.pdf -> export en .PDF ◊

---

## 💼 Business

- `GET /api/contracts` → liste contrats ◊
- `POST /api/contracts` → créer contrat ◊
- `GET /api/subscription` → abonnement utilisateur ◊
- `POST /api/payments` → créer paiement ◊
- `GET /api/payments` → liste paiements ◊

GET /api/providers

### 💰 Wallet
- `GET /api/wallet` → balance utilisateur connecté ◊
- `GET /api/wallet/txs?limit=50` → transactions ◊
- `POST /api/wallet/credit` → créditer (ADMIN) ◊
- `POST /api/wallet/debit` → débiter (CLIENT/PROVIDER) ◊

---

## 🛠 Providers

- `GET /api/providers` → liste providers
- `GET /api/providers/:id` → détail provider
- `PATCH /api/providers/:id` → update provider
- `GET /api/providers/missions` → missions
- `GET /api/providers/ranked` → classement
- `GET /api/providers/top` → top providers
Créer un provider (POST /api/providers).

Lister (GET /api/providers).

Modifier son statut (PATCH /api/providers/status).

Récupérer les nearby (GET /api/providers/nearby).

Créer une mission (à ajouter côté client API).

L’accepter (POST /missions/:id/accept).

La clôturer (POST /missions/:id/done).

La rejouer avec une annulation (POST /missions/:id/cancel).

---

## 📦 Requests

- `POST /api/requests/create` → créer une requête
- `GET /api/requests/read/:id` → lire une requête
- `POST /api/requests/actions/accept` → accepter
- `POST /api/requests/actions/decline` → refuser
- `POST /api/requests/actions/complete` → terminer

### ⚡ Matching
- `POST /api/matching/:requestId` → trouve le meilleur provider pour une requête (Socket.IO notification)

---

## 📩 Autres

- `GET /api/tickets` → tickets support ◊
- `GET /api/notifications` → notifications ◊
- `GET /api/messages` → messages ◊
- `POST /api/ratings` → ajouter une note ◊
- `GET /api/uploads/:file` → fichier uploadé ◊

---

## 🔒 Admin

- `GET /api/admin/overview` → dashboard admin (stats, dernières demandes & users)

---

## ⚡ Temps réel (Socket.IO)

- Event `provider:join` → un provider se connecte ◊
- Event `provider:set_status` → mise à jour du statut ◊
 - Event `new_request` → notification envoyée à un provider ◊ sélectionné
- Event `provider:status_update` → broadcast des statuts ◊

---

## ⚠️ Codes d’erreurs

- `400 Bad Request` → données invalides
- `401 Unauthorized` → utilisateur non authentifié
- `403 Forbidden` → rôle insuffisant
- `404 Not Found` → ressource introuvable
- `500 Internal Server Error` → erreur serveur

{
  "email": "admin@mosaic.com",
  "password": "Mosaic@2025"
}

                          ┌──────────────────────┐
                          │      Admin API       │
                          │ (carrefour/arbitre)  │
                          └─────────┬────────────┘
                                    │
      ┌─────────────────────────────┼─────────────────────────────┐
      │                             │                             │
      ▼                             ▼                             ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│   Users        │            │  Providers    │            │   Requests    │
│ - CRUD (create)│            │ - Liste       │            │ - Liste       │
│ - Update       │            │ - Pagination  │            │ - Détail      │
│ - Ban/Delete   │            │ - Activation  │            │ - Status Mgmt │
│ - Roles assign │            │ - Statut      │            │ - Assignation │
└───────────────┘            └───────────────┘            └───────────────┘
      │                             │                             │
      ▼                             ▼                             ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│ Subscriptions │            │   Tickets     │            │ Notifications │
│ - Create plan │            │ - Liste       │            │ - Liste       │
│ - Assign user │            │ - Status Mgmt │            │ - Mark read   │
│ - Manage pay. │            │ - Delete      │            │ - Delete      │
└───────────────┘            └───────────────┘            └───────────────┘
                                    │
                                    ▼
                             ┌───────────────┐
                             │   Files       │
                             │ - Liste       │
                             │ - Upload mgmt │
                             │ - Delete      │
                             └───────────────┘
