# 🚀 Guide de Démarrage et d'Installation

Ce guide vous explique comment l'application a été configurée, installée, démarrée, et comment vous pouvez la gérer pour y apporter des modifications plus tard.

---

## 🛠️ Ce qui a été fait

1. **Installation des dépendances :**
   - Toutes les dépendances du monorepo ont été installées avec succès via la commande :
     ```bash
     pnpm install
     ```

2. **Résolution d'une erreur de compilation (Build/Typecheck) :**
   - Une erreur de type TS2339 existait dans `artifacts/api-server/src/routes/wallet.ts` car le backend accédait à `bankName` et `ribNumber` dans l'objet de retrait alors qu'ils n'étaient pas déclarés dans la spec OpenAPI.
   - Nous avons mis à jour `lib/api-spec/openapi.yaml` pour ajouter ces champs à `WithdrawalInput`, puis régénéré les types via `pnpm --filter "@workspace/api-spec" run codegen`.
   - Désormais, le projet compile et build à 100% sans aucune erreur.

3. **Build du Monorepo :**
   - Nous avons vérifié et compilé l'ensemble des modules (API, Frontend, Mockup Sandbox) avec succès via :
     ```bash
     pnpm run build
     ```

4. **Démarrage des serveurs en arrière-plan :**
   - L'API backend écoute sur le port **3001**.
   - Le serveur de développement Vite (Frontend) écoute sur le port **5173** (avec proxy automatique de `/api` vers `localhost:3001`).

---

## 🚦 Comment gérer l'application

### 1. Vérifier si les services tournent
Pour vérifier les ports actifs sur votre machine :
```bash
lsof -i :3001   # Pour l'API
lsof -i :5173   # Pour le Frontend
```

### 2. Voir les logs en temps réel
Les logs des serveurs sont écrits localement (et ignorés par Git pour garder votre dépôt propre) :
- Logs de l'API :
  ```bash
  cat api_server.log
  # ou en continu :
  tail -f api_server.log
  ```
- Logs du Frontend Vite :
  ```bash
  cat frontend.log
  # ou en continu :
  tail -f frontend.log
  ```

### 3. Redémarrer les serveurs
Si vous apportez des modifications et souhaitez relancer les serveurs proprement :
```bash
# Éteindre les serveurs existants
kill $(lsof -t -i :3001) 2>/dev/null || true
kill $(lsof -t -i :5173) 2>/dev/null || true

# Lancer l'API Backend
PORT=3001 node --enable-source-maps ./artifacts/api-server/dist/index.mjs > api_server.log 2>&1 &

# Lancer le Frontend Vite
API_PORT=3001 PORT=5173 pnpm --filter "@workspace/digital-ecom-land" run dev > frontend.log 2>&1 &
```

### 4. Tester l'API en local
```bash
curl http://localhost:3001/api/healthz
# Réponse attendue : {"status":"ok"}
```

---

## 📂 Structure des dossiers pour vos modifications futures

- **Frontend (UI) :** `artifacts/digital-ecom-land/src/`
- **Backend (API) :** `artifacts/api-server/src/`
- **Modèles de données (Zod & API Spec) :** `lib/api-spec/openapi.yaml` (Exécutez `pnpm --filter "@workspace/api-spec" run codegen` après modification).
