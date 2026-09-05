# 🚀 DÉMARRAGE RAPIDE - Digital Ecom Land

## ⚡ Configuration Automatique (Recommandé)

### Étape 1 : Récupérer le mot de passe Supabase

1. Allez sur https://supabase.com/dashboard/project/nfoefhwmgjatbqyibclp
2. Settings → Database → Connection string
3. Copiez le mot de passe

### Étape 2 : Exécuter le script

```powershell
.\setup-supabase.ps1
```

Le script va :
- ✅ Vous demander le mot de passe Supabase
- ✅ Installer les dépendances
- ✅ Créer toutes les tables
- ✅ Créer l'admin par défaut
- ✅ Tout configurer automatiquement

**Temps estimé : 3-5 minutes**

---

## 🎯 Étape 3 : Créer le bucket Storage

**IMPORTANT** : Le bucket doit être créé manuellement sur Supabase

1. Allez sur https://supabase.com/dashboard/project/nfoefhwmgjatbqyibclp/storage/buckets
2. Cliquez sur **Create a new bucket**
3. Configurez :
   - **Name** : `telegram-media`
   - **Public bucket** : ✅ **COCHÉ** (important !)
4. Cliquez sur **Create bucket**

---

## 🚀 Étape 4 : Démarrer l'application

### Terminal 1 - Backend API

```powershell
cd artifacts/api-server
pnpm run dev
```

Vous devriez voir :
```
🚀 Server running on http://localhost:8080
```

### Terminal 2 - Frontend (si pas déjà lancé)

```powershell
cd artifacts/digital-ecom-land
pnpm run dev
```

Vous devriez voir :
```
➜ Local:   http://localhost:5173/
```

---

## 🧪 Étape 5 : Tester

### Test 1 : Ouvrir l'application

Ouvrez http://localhost:5173

### Test 2 : Login Admin

**Credentials :**
- Email: `admin@digitalecomland.com`
- Password: `admin123456`

⚠️ Changez ce mot de passe après la première connexion !

### Test 3 : Accéder au Admin Panel

Une fois connecté, allez sur : http://localhost:5173/admin

Vous devriez voir le dashboard admin avec :
- Dashboard
- Produits
- Catégories
- Fournisseurs
- Agences Livraison
- Affiliés
- Commandes

---

## ✅ CHECKLIST RAPIDE

- [ ] Script `setup-supabase.ps1` exécuté avec succès
- [ ] Bucket `telegram-media` créé sur Supabase (PUBLIC)
- [ ] Backend démarré (port 8080)
- [ ] Frontend démarré (port 5173)
- [ ] Connexion admin réussie
- [ ] Accès au admin panel

---

## 🎯 PROCHAINE ÉTAPE : MODULE TELEGRAM

Une fois tout configuré, nous pouvons créer :

### PHASE 2 - Tables Telegram

Créer les tables :
- `telegram_connections` - Connexions Telegram
- `telegram_channels` - Canaux surveillés
- `telegram_messages` - Messages reçus
- `telegram_media` - Médias téléchargés
- `supplier_products` - Produits extraits

### PHASE 4 - Collecteur Telegram

Implémenter :
- Client MTProto avec Telethon
- Collecteur de messages en temps réel
- Téléchargement automatique des médias
- Upload vers Supabase Storage
- Extraction intelligente des infos

### PHASE 5 - Interface Admin

Créer les pages :
- `/admin/telegram` - Dashboard Telegram
- `/admin/telegram/channels` - Gestion canaux
- `/admin/telegram/products` - Produits reçus

---

## 📚 DOCUMENTATION

- **AUTH-GUIDE.md** - Guide complet authentification
- **SUPABASE-SETUP.md** - Configuration détaillée Supabase
- **TELEGRAM-MODULE-PLAN.md** - Plan complet du module Telegram
- **PHASE-3-SUMMARY.md** - Résumé technique Phase 3

---

## 🐛 PROBLÈMES COURANTS

### Backend ne démarre pas

**Vérifiez :**
- Le mot de passe Supabase dans `.env`
- Les tables créées sur Supabase Dashboard
- Port 8080 disponible

**Solution :**
```powershell
cd artifacts/api-server
pnpm install
pnpm run build
pnpm run dev
```

### Frontend ne démarre pas

```powershell
cd artifacts/digital-ecom-land
Remove-Item -Recurse -Force node_modules
pnpm install
pnpm run dev
```

### Impossible de se connecter

**Vérifiez :**
- L'admin existe dans la table `users` (Supabase Dashboard → Table Editor)
- Le backend tourne (http://localhost:8080/api/health)

**Recréer l'admin :**
```powershell
cd artifacts/api-server
pnpm tsx scripts/create-admin.ts
```

---

## 🎉 TOUT EST PRÊT !

Votre application Digital Ecom Land est maintenant :
- ✅ Connectée à Supabase
- ✅ Sécurisée avec authentification JWT
- ✅ Prête pour le module Telegram

**Voulez-vous que je continue avec les tables Telegram maintenant ?** 🚀
