# 🚀 Démarrage Rapide - Digital Ecom Land

## ⚡ Démarrage Automatique (Recommandé)

### Windows PowerShell

```powershell
.\start-local.ps1
```

C'est tout ! Le script va :
- ✅ Vérifier Node.js et pnpm
- ✅ Installer les dépendances si nécessaire
- ✅ Builder l'API
- ✅ Démarrer Backend + Frontend
- ✅ Ouvrir le navigateur automatiquement

---

## 📂 Structure de l'Application

### 🏢 **ADMIN (Back-Office)**
Routes : `/admin/*`

**Pages disponibles :**
- `/admin` - Dashboard administrateur
- `/admin/products` - Gestion des produits
- `/admin/categories` - Gestion des catégories
- `/admin/suppliers` - Gestion des fournisseurs
- `/admin/delivery-agencies` - Agences de livraison
- `/admin/affiliates` - Gestion des affiliés
- `/admin/orders` - Gestion des commandes

**Fichiers à modifier :**
```
artifacts/digital-ecom-land/src/
├── pages/admin/
│   ├── AdminDashboard.tsx       ← Dashboard admin
│   ├── AdminProducts.tsx        ← Gestion produits
│   ├── AdminCategories.tsx      ← Gestion catégories
│   ├── AdminSuppliers.tsx       ← Gestion fournisseurs
│   ├── AdminDeliveryAgencies.tsx ← Agences livraison
│   ├── AdminAffiliates.tsx      ← Gestion affiliés
│   └── AdminOrders.tsx          ← Gestion commandes
└── components/
    └── AdminLayout.tsx          ← Layout admin (menu, header)
```

---

### 🏪 **VITRINE (Frontend Public)**
Routes : `/` et `/dashboard/*`

**Pages disponibles :**
- `/` - Page d'accueil publique
- `/dashboard` - Dashboard utilisateur
- `/dashboard/products` - Catalogue produits
- `/dashboard/orders` - Mes commandes
- `/dashboard/wallet` - Mon portefeuille
- `/dashboard/analytics` - Mes statistiques
- `/dashboard/settings` - Paramètres

**Fichiers à modifier :**
```
artifacts/digital-ecom-land/src/
├── pages/
│   ├── LandingPage.tsx          ← Page d'accueil
│   ├── DashboardPage.tsx        ← Dashboard utilisateur
│   ├── ProductsPage.tsx         ← Catalogue produits
│   ├── OrdersPage.tsx           ← Mes commandes
│   ├── WalletPage.tsx           ← Portefeuille
│   ├── AnalyticsPage.tsx        ← Statistiques
│   └── SettingsPage.tsx         ← Paramètres
└── components/
    └── DashboardLayout.tsx      ← Layout dashboard (menu, header)
```

---

### 🔧 **BACKEND (API)**
Port : `8080`

**Routes API :**
```
artifacts/api-server/src/routes/
├── admin.ts           ← Routes admin (/api/admin/*)
├── products.ts        ← Routes produits (/api/products/*)
├── orders.ts          ← Routes commandes (/api/orders/*)
├── analytics.ts       ← Routes analytics (/api/analytics/*)
├── wallet.ts          ← Routes portefeuille (/api/wallet/*)
├── dashboard.ts       ← Routes dashboard (/api/dashboard/*)
└── health.ts          ← Health check (/api/health)
```

---

## 🎯 Modification du Côté Admin

### 1️⃣ **Exemple : Modifier le Dashboard Admin**

Ouvrez : `artifacts/digital-ecom-land/src/pages/admin/AdminDashboard.tsx`

```tsx
// Le fichier se recharge automatiquement après sauvegarde
export function AdminDashboard() {
  return (
    <div>
      <h1>Mon Nouveau Dashboard Admin</h1>
      {/* Vos modifications ici */}
    </div>
  );
}
```

### 2️⃣ **Exemple : Ajouter une Nouvelle Route Admin**

Dans `artifacts/digital-ecom-land/src/App.tsx` :

```tsx
import { AdminNewPage } from '@/pages/admin/AdminNewPage';

// Ajoutez dans le Router :
<Route path="/admin/new-page">
  <AdminLayout><AdminNewPage /></AdminLayout>
</Route>
```

### 3️⃣ **Exemple : Modifier le Menu Admin**

Ouvrez : `artifacts/digital-ecom-land/src/components/AdminLayout.tsx`

---

## 🛠️ Commandes Utiles

### Démarrage Manuel

```powershell
# Terminal 1 - API Backend
cd artifacts/api-server
pnpm run dev

# Terminal 2 - Frontend
cd artifacts/digital-ecom-land
pnpm run dev
```

### Build Production

```powershell
# Build tout
pnpm run build

# Build API uniquement
cd artifacts/api-server
pnpm run build

# Build Frontend uniquement
cd artifacts/digital-ecom-land
pnpm run build
```

### Tests

```powershell
# Typecheck (vérifier les erreurs TypeScript)
pnpm run typecheck
```

---

## 📡 URLs en Développement

| Service | URL | Description |
|---------|-----|-------------|
| **Vitrine** | http://localhost:5173 | Page publique |
| **Admin** | http://localhost:5173/admin | Back-office admin |
| **Dashboard** | http://localhost:5173/dashboard | Espace utilisateur |
| **API** | http://localhost:8080 | Backend REST API |
| **API Health** | http://localhost:8080/api/health | Status de l'API |

---

## 🔥 Hot Reload (Rechargement Automatique)

✅ **Tous vos changements se rechargent automatiquement !**

- Modifiez un fichier `.tsx` → Le navigateur se recharge
- Modifiez un fichier `.ts` côté API → L'API redémarre
- Modifiez un fichier `.css` → Les styles se mettent à jour

---

## 🐛 Dépannage

### Port déjà utilisé

```powershell
# Trouver le processus sur le port 5173
Get-Process | Where-Object {$_.MainWindowTitle -like "*5173*"}

# Ou tuer le processus
Stop-Process -Name "node" -Force
```

### Erreur de dépendances

```powershell
# Nettoyer et réinstaller
Remove-Item -Recurse -Force node_modules
pnpm install
```

### Base de données non configurée

L'application fonctionne en mode in-memory par défaut.

Pour PostgreSQL, modifiez `.env` :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/digitalecomland
```

---

## 📝 Prochaines Étapes

1. ✅ Lancez `.\start-local.ps1`
2. ✅ Ouvrez http://localhost:5173/admin
3. ✅ Explorez les pages admin existantes
4. ✅ Modifiez `artifacts/digital-ecom-land/src/pages/admin/AdminDashboard.tsx`
5. ✅ Observez le rechargement automatique dans le navigateur !

---

## 🎨 Structure des Composants

```
artifacts/digital-ecom-land/src/
├── components/
│   ├── ui/               ← Composants UI (shadcn/ui)
│   ├── AdminLayout.tsx   ← Layout admin avec menu
│   └── DashboardLayout.tsx ← Layout utilisateur
├── pages/
│   ├── admin/            ← Pages back-office
│   └── ...               ← Pages publiques/dashboard
├── hooks/                ← React hooks personnalisés
├── lib/                  ← Utilitaires
└── i18n/                 ← Traductions (FR/EN)
```

---

## 🚀 Déploiement

Une fois vos modifications terminées :

```powershell
# Commit vos changements
git add .
git commit -m "Mise à jour du back-office admin"
git push origin main

# Déployer sur le serveur Ubuntu (100.78.217.97)
# Connectez-vous au serveur et exécutez :
ssh redsky@100.78.217.97
cd ~/digitalecomland
git pull
pnpm install
pnpm run build
pm2 restart all
```

---

**Besoin d'aide ?** 
- Les logs API : `api-server.log`
- Les logs Frontend : `frontend.log`

**Bon développement ! 🎉**
