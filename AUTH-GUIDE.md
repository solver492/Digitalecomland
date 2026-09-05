# 🔐 Guide d'Authentification - Digital Ecom Land

## ✅ PHASE 3 TERMINÉE

Le système d'authentification JWT est maintenant intégré dans l'application.

---

## 📂 Fichiers Créés

### Base de Données
```
lib/db/src/schema/
└── users.ts          # Table users avec rôles (admin, affiliate, user)
```

### Backend
```
artifacts/api-server/src/
├── lib/
│   ├── hash.ts       # Hashing passwords (scrypt)
│   └── jwt.ts        # Génération/vérification tokens JWT
├── middlewares/
│   └── auth.ts       # Middleware auth (requireAuth, requireAdmin, requireAffiliate)
├── routes/
│   └── auth.ts       # Routes: /auth/register, /auth/login, /auth/me, /auth/logout
└── scripts/
    └── create-admin.ts  # Script pour créer admin par défaut
```

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Appliquer le schéma DB

```bash
# Dans le dossier racine
cd lib/db
pnpm run push
```

Cela va créer la table `users` dans PostgreSQL.

### 2. Créer un admin par défaut

```bash
cd artifacts/api-server
pnpm tsx scripts/create-admin.ts
```

**Credentials par défaut :**
- Email: `admin@digitalecomland.com`
- Password: `admin123456`

⚠️ **IMPORTANT** : Changez ce mot de passe après la première connexion !

### 3. Tester l'authentification

#### A. Register (Créer un nouveau compte)

```bash
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User",
  "role": "user"
}
```

**Réponse:**
```json
{
  "user": {
    "id": 1,
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-09-05T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### B. Login

```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@digitalecomland.com",
  "password": "admin123456"
}
```

**Réponse:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@digitalecomland.com",
    "fullName": "Admin User",
    "role": "admin",
    "isActive": true,
    "createdAt": "2026-09-05T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### C. Get Current User (Protected)

```bash
GET http://localhost:8080/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@digitalecomland.com",
    "fullName": "Admin User",
    "role": "admin",
    "isActive": true,
    "createdAt": "2026-09-05T..."
  }
}
```

#### D. Access Admin Route (Protected)

```bash
GET http://localhost:8080/api/admin/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ Si token valide + rôle admin → Accès autorisé
❌ Sinon → 401 Unauthorized ou 403 Forbidden

---

## 🔒 PROTECTION DES ROUTES

### Routes Publiques (Pas d'auth requise)
- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Routes Protégées (Auth requise)
- `GET /api/auth/me`
- `POST /api/auth/logout`
- Toutes les routes `/api/orders/*`
- Toutes les routes `/api/wallet/*`
- Toutes les routes `/api/analytics/*`
- Toutes les routes `/api/dashboard/*`
- Toutes les routes `/api/profile/*`

### Routes Admin (Auth + Admin role)
- Toutes les routes `/api/admin/*`
  - `/api/admin/stats`
  - `/api/admin/products`
  - `/api/admin/categories`
  - `/api/admin/suppliers`
  - `/api/admin/delivery-agencies`
  - `/api/admin/affiliates`

---

## 🛠️ UTILISATION DANS LE CODE

### Backend: Protéger une nouvelle route

```typescript
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

// Route publique
router.get("/api/public/data", (req, res) => {
  res.json({ data: "public" });
});

// Route protégée (authentification requise)
router.get("/api/protected/data", requireAuth, (req, res) => {
  // req.user contient: { userId, email, role }
  res.json({ 
    data: "protected", 
    user: req.user 
  });
});

// Route admin (authentification + rôle admin)
router.get("/api/admin/sensitive", requireAuth, requireAdmin, (req, res) => {
  res.json({ data: "admin only" });
});

export default router;
```

### Frontend: Utiliser le token

#### 1. Stocker le token après login

```typescript
// Dans votre composant login
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});

const { user, token } = await response.json();

// Stocker le token
localStorage.setItem("authToken", token);
localStorage.setItem("user", JSON.stringify(user));
```

#### 2. Envoyer le token avec chaque requête

```typescript
const token = localStorage.getItem("authToken");

const response = await fetch("/api/admin/stats", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

#### 3. Créer un helper API client (Recommandé)

```typescript
// lib/api-client.ts
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem("authToken");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error(await response.text());
  }

  return response.json();
}

// Utilisation
const stats = await apiRequest<AdminStats>("/api/admin/stats");
```

---

## 🔑 JWT TOKEN

### Structure du Payload

```json
{
  "userId": 1,
  "email": "admin@digitalecomland.com",
  "role": "admin",
  "iat": 1725542400,
  "exp": 1726147200,
  "iss": "digitalecomland-api",
  "aud": "digitalecomland-app"
}
```

### Durée de validité

Par défaut: **7 jours** (configurable via `JWT_EXPIRES_IN`)

### Renouvellement

Le token doit être renouvelé par le frontend:
- Option 1: Re-login quand le token expire
- Option 2: Implémenter un refresh token (à ajouter plus tard)

---

## 👥 RÔLES UTILISATEURS

### Admin
- Accès complet au backoffice
- CRUD sur tous les modules
- Gestion des utilisateurs
- Accès aux routes `/api/admin/*`

### Affiliate (Affilié)
- Accès au dashboard affilié
- Gestion de ses commandes
- Statistiques personnelles
- Wallet et retraits

### User (Utilisateur)
- Accès limité
- Consultation produits
- Pas d'accès admin/affiliate

---

## 🔐 SÉCURITÉ

### ✅ Implémenté

1. **Password Hashing**
   - Algorithme: `scrypt` (Node.js crypto)
   - Salt unique par utilisateur
   - Timing-safe comparison

2. **JWT Tokens**
   - Signed with secret key
   - Expiration time
   - Issuer/Audience validation

3. **Middleware Auth**
   - Token verification
   - Role-based access control
   - Request user injection

4. **Input Validation**
   - Zod schemas
   - Email format
   - Password min length

### 🔄 À Ajouter (Optionnel)

- [ ] Rate limiting (express-rate-limit)
- [ ] Refresh tokens
- [ ] Email verification
- [ ] Password reset
- [ ] 2FA (Two-Factor Authentication)
- [ ] Session management (logout all devices)
- [ ] Audit logs (login attempts, etc.)

---

## 🧪 TESTS

### Test manuel avec curl

```bash
# 1. Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# 2. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digitalecomland.com","password":"admin123456"}'

# 3. Get current user (remplacer TOKEN)
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# 4. Access admin route (remplacer TOKEN)
curl http://localhost:8080/api/admin/stats \
  -H "Authorization: Bearer TOKEN"
```

---

## 📝 VARIABLES D'ENVIRONNEMENT

Dans `.env`:

```env
# JWT Configuration
JWT_SECRET=dev-secret-change-in-production-use-long-random-string-min-32-chars
JWT_EXPIRES_IN=7d
```

⚠️ **PRODUCTION** :
- Générez un secret aléatoire long (min 32 caractères)
- Utilisez un générateur sécurisé: `openssl rand -hex 32`
- **NE JAMAIS** committer le vrai secret dans Git

---

## 🎯 PROCHAINES ÉTAPES

Maintenant que l'authentification est en place, vous pouvez :

1. ✅ **Créer l'interface de login** (frontend React)
2. ✅ **Protéger les pages admin** (vérifier token avant d'accéder)
3. ✅ **Continuer avec PHASE 2** : Schémas DB Telegram
4. ✅ **Implémenter le module Telegram** avec auth sécurisée

---

## 🐛 TROUBLESHOOTING

### "Authentication required. No token provided."
→ Vérifiez que le header `Authorization: Bearer TOKEN` est présent

### "Invalid or expired token."
→ Le token a expiré (7j) ou est invalide. Re-login requis.

### "Admin access required."
→ L'utilisateur n'a pas le rôle admin. Vérifiez `user.role` dans la DB.

### "Email already registered"
→ Un utilisateur avec cet email existe déjà. Utilisez un autre email ou login.

---

**✅ PHASE 3 AUTHENTIFICATION TERMINÉE !**

Toutes les routes admin sont maintenant protégées. Prêt pour la suite du module Telegram ! 🚀
