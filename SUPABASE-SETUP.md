# 🚀 CONFIGURATION SUPABASE - Digital Ecom Land

## ✅ Informations Supabase

**Projet:** digitalecomland  
**ID:** [Voir votre Supabase Dashboard]  
**URL:** [Voir votre Supabase Dashboard]

---

## 🔧 ÉTAPE 1 : Récupérer le mot de passe de la base de données

### Option A : Depuis le Dashboard Supabase (Recommandé)

1. Allez sur votre Dashboard Supabase
2. Cliquez sur **Settings** (⚙️) dans le menu gauche
3. Cliquez sur **Database**
4. Cherchez **Connection string** ou **Connection pooling**
5. Copiez le mot de passe affiché

### Option B : Réinitialiser le mot de passe

1. Dashboard → Settings → Database
2. Cliquez sur **Reset database password**
3. Générez un nouveau mot de passe
4. **IMPORTANT** : Copiez-le immédiatement (il ne sera plus affiché)

---

## 🔧 ÉTAPE 2 : Mettre à jour le fichier .env

Ouvrez le fichier `.env` à la racine du projet et remplacez `[YOUR-PASSWORD]` par votre mot de passe Supabase :

```env
# Avant
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_ID:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# Après (exemple avec mot de passe "mySecurePassword123")
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_ID:mySecurePassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Le fichier `.env` doit être configuré avec vos credentials Supabase :
```env
PORT=8080
NODE_ENV=development

DATABASE_URL=postgresql://postgres.PROJECT_ID:[YOUR-DB-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

JWT_SECRET=dev-secret-change-in-production-use-long-random-string-min-32-chars
JWT_EXPIRES_IN=7d

SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SECRET_KEY=your-supabase-secret-key
```

---

## 🔧 ÉTAPE 3 : Appliquer le schéma de base de données

Une fois le mot de passe configuré, exécutez ces commandes pour créer toutes les tables :

```powershell
# 1. Aller dans le dossier db
cd lib/db

# 2. Appliquer le schéma (crée les tables)
pnpm run push

# 3. Vérifier que les tables sont créées
# Retournez sur Supabase Dashboard → Table Editor
# Vous devriez voir les tables : users, products, orders, etc.
```

**Tables qui seront créées :**
- ✅ `users` - Utilisateurs avec rôles (admin, affiliate, user)
- ✅ `products` - Catalogue produits
- ✅ `orders` - Commandes
- ✅ `withdrawals` - Retraits affiliés
- ✅ `profile` - Profils utilisateurs

---

## 🔧 ÉTAPE 4 : Créer un administrateur par défaut

```powershell
# Retour à la racine
cd ../..

# Aller dans api-server
cd artifacts/api-server

# Créer l'admin
pnpm tsx scripts/create-admin.ts
```

**Credentials par défaut :**
- Email: `admin@digitalecomland.com`
- Password: `admin123456`

⚠️ **À faire après première connexion** : Changez ce mot de passe !

---

## 🔧 ÉTAPE 5 : Créer le bucket Storage (Pour les médias Telegram)

### Via Dashboard Supabase

1. Allez sur https://supabase.com/dashboard/project/nfoefhwmgjatbqyibclp
2. Cliquez sur **Storage** dans le menu gauche
3. Cliquez sur **Create a new bucket**
4. Configurez :
   - **Name** : `telegram-media`
   - **Public bucket** : ✅ Coché (pour accès public aux images)
   - **Allowed MIME types** : Laissez vide (accepte tous types) ou spécifiez : `image/*, video/*, application/pdf`
5. Cliquez sur **Create bucket**

### Structure des dossiers (sera créée automatiquement)

```
telegram-media/
├── images/
│   └── {channel_id}/
│       └── {message_id}_0.jpg
├── videos/
│   └── {channel_id}/
│       └── {message_id}.mp4
└── documents/
    └── {channel_id}/
        └── {message_id}_doc.pdf
```

---

## 🚀 ÉTAPE 6 : Démarrer l'application

### Démarrer le Backend (API)

```powershell
cd artifacts/api-server
pnpm run dev
```

Vous devriez voir :
```
🚀 Server running on http://localhost:8080
✅ Database connected
```

### Démarrer le Frontend (déjà en cours)

Le frontend devrait déjà tourner sur http://localhost:5173

Si ce n'est pas le cas :
```powershell
cd artifacts/digital-ecom-land
pnpm run dev
```

---

## 🧪 ÉTAPE 7 : Tester la connexion

### Test 1 : Health Check

```powershell
curl http://localhost:8080/api/health
```

**Réponse attendue :**
```json
{
  "status": "ok",
  "timestamp": "2026-09-05T..."
}
```

### Test 2 : Login Admin

```powershell
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{\"email\":\"admin@digitalecomland.com\",\"password\":\"admin123456\"}'
```

**Réponse attendue :**
```json
{
  "user": {
    "id": 1,
    "email": "admin@digitalecomland.com",
    "fullName": "Admin User",
    "role": "admin",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Si vous recevez un token JWT, **tout fonctionne !** ✅

### Test 3 : Route Admin Protégée

Utilisez le token reçu :

```powershell
# Remplacez YOUR_TOKEN par le token reçu
curl http://localhost:8080/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse attendue :**
```json
{
  "totalRevenue": 0,
  "totalOrders": 0,
  "delivered": 0,
  ...
}
```

---

## 📊 ÉTAPE 8 : Vérifier les tables dans Supabase

1. Dashboard Supabase → **Table Editor**
2. Vous devriez voir toutes les tables créées
3. Cliquez sur `users` → Vérifiez que l'admin existe

---

## 🔐 SÉCURITÉ - IMPORTANT

### À faire AVANT de déployer en production :

1. **Changez le JWT_SECRET** dans `.env`
   ```powershell
   # Générer un secret aléatoire
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
2. **Changez les clés Supabase** (comme vous l'avez mentionné)
   - Dashboard → Settings → API
   - Regénérez `SUPABASE_SECRET_KEY`

3. **Changez le mot de passe admin**
   - Connectez-vous avec `admin@digitalecomland.com`
   - Allez dans Paramètres → Changez le mot de passe

4. **Activez Row Level Security (RLS) sur Supabase**
   - Dashboard → Authentication → Policies
   - Créez des politiques pour protéger vos tables

---

## 🐛 DÉPANNAGE

### Erreur : "Failed to connect to database"

**Solution :**
- Vérifiez que le mot de passe est correct dans `.env`
- Vérifiez que votre IP est autorisée (Supabase Dashboard → Settings → Database → Connection pooling)
- Vérifiez que la connexion string est complète

### Erreur : "pnpm run push" échoue

**Solution :**
```powershell
# Nettoyer et réinstaller
cd lib/db
Remove-Item -Recurse -Force node_modules
pnpm install
pnpm run push
```

### Erreur : "Cannot find module @workspace/db"

**Solution :**
```powershell
# À la racine du projet
pnpm install
```

---

## 📋 CHECKLIST COMPLÈTE

- [ ] Récupéré le mot de passe Supabase
- [ ] Mis à jour `DATABASE_URL` dans `.env`
- [ ] Exécuté `pnpm run push` dans `lib/db`
- [ ] Tables créées sur Supabase (vérifiées dans Dashboard)
- [ ] Créé admin avec `pnpm tsx scripts/create-admin.ts`
- [ ] Créé bucket `telegram-media` sur Supabase Storage
- [ ] Backend démarré (`pnpm run dev` dans api-server)
- [ ] Frontend démarré (localhost:5173)
- [ ] Test health check réussi
- [ ] Test login admin réussi
- [ ] Test route protégée réussi

---

## 🎯 PROCHAINES ÉTAPES

Une fois tout configuré et fonctionnel :

1. ✅ **L'authentification est en place**
2. ✅ **Supabase est connecté**
3. ✅ **Les tables de base sont créées**

**Prochaines actions :**
- Ajouter les tables Telegram (connections, channels, messages, media)
- Créer le collecteur Telegram MTProto
- Implémenter les routes API Telegram
- Créer les pages admin Telegram

**Voulez-vous que je continue avec les tables Telegram maintenant ?** 🚀

---

## 📞 AIDE

Si vous rencontrez des problèmes, vérifiez :
1. Dashboard Supabase → Logs
2. Console backend (terminal où tourne `pnpm run dev`)
3. Console navigateur (F12)

**TOUT EST CONFIGURÉ ET DOCUMENTÉ ! 🎉**
