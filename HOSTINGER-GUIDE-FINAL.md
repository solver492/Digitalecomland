# 🎯 Guide Final - Configuration Node.js sur Hostinger

## ✅ Ce qui est Déjà Fait

- ✅ Frontend déployé sur **http://digitalsolverland.space**
- ✅ Fichiers de l'API préparés et configurés
- ✅ Structure optimisée pour Hostinger
- ✅ Variables d'environnement configurées

---

## 🚀 Configuration dans hPanel (5 minutes)

### Étape 1 : Connexion à hPanel

1. Allez sur : **https://hpanel.hostinger.com**
2. Connectez-vous avec vos identifiants Hostinger
3. Sélectionnez votre hébergement

### Étape 2 : Accéder à la Configuration Node.js

1. Dans le menu de gauche, cliquez sur **"Advanced"**
2. Trouvez et cliquez sur **"Node.js"**
3. Vous verrez la liste de vos applications Node.js

### Étape 3 : Modifier l'Application Existante

**Si vous avez déjà créé une application**, cliquez sur les **3 points (⋮)** > **"Edit"**

**Sinon, cliquez sur "Create Application"**

### Étape 4 : Paramètres de Configuration

Remplissez **EXACTEMENT** comme suit :

#### 📁 Configuration de Base

```
Application root (obligatoire):
/home/u696346042/domains/digitalsolverland.space/api

Application URL (obligatoire):
digitalsolverland.space/api

Application startup file (obligatoire):
index.mjs

Node.js version:
20.x (ou la dernière disponible)
```

#### 🔧 Variables d'Environnement

Cliquez sur **"Add Environment Variable"** et ajoutez ces 3 variables :

**Variable 1:**
```
Name: PORT
Value: 3001
```

**Variable 2:**
```
Name: NODE_ENV
Value: production
```

**Variable 3:**
```
Name: DATABASE_URL
Value: postgresql://digitalecomland_user:DigitalEcom2024!Secure@localhost:5432/digitalecomland
```

#### ⚙️ Gestionnaire de Paquets

```
Package manager: npm
```

### Étape 5 : Sauvegarder et Démarrer

1. Cliquez sur **"Create"** (ou **"Save"** si vous modifiez)
2. Attendez que l'application soit créée (30 secondes)
3. Une fois créée, cliquez sur le bouton **"Start"** (▶️)
4. Attendez que le statut devienne **"Running"** (cercle vert)

---

## 🧪 Vérification

### Test 1 : Frontend

Ouvrez dans votre navigateur : **http://digitalsolverland.space**

✅ Vous devriez voir votre application React

### Test 2 : API

Ouvrez dans votre navigateur : **http://digitalsolverland.space/api/health**

✅ Vous devriez voir une réponse JSON de l'API

---

## 🔍 Dépannage

### Problème : L'application ne démarre pas

1. Dans hPanel > Node.js, cliquez sur votre application
2. Regardez les **logs** en bas de la page
3. Vérifiez que tous les paramètres sont corrects

### Problème : "Cannot find module"

**Solution** : Dans hPanel, cliquez sur **"Reinstall Dependencies"** puis **"Restart"**

### Problème : "Port already in use"

**Solution** : Changez le port à `3002` dans les variables d'environnement ET dans le fichier de configuration

### Problème : L'API ne répond pas

1. Vérifiez que l'application est **"Running"** (vert) dans hPanel
2. Attendez 1-2 minutes après le démarrage
3. Vérifiez les logs dans hPanel

---

## 📱 Configuration Alternative (Si hPanel ne Fonctionne Pas)

Si vous rencontrez des problèmes avec hPanel, vous pouvez utiliser **Railway** ou **Render** pour héberger l'API :

### Option A : Railway (Recommandé - Plus Simple)

1. Allez sur : **https://railway.app**
2. Connectez-vous avec GitHub
3. Cliquez sur **"New Project"** > **"Deploy from GitHub"**
4. Autorisez Railway à accéder à votre repository (ou créez-en un)
5. Railway détectera automatiquement Node.js et déploiera l'API

### Option B : Render

1. Allez sur : **https://render.com**
2. Connectez-vous avec GitHub
3. Cliquez sur **"New Web Service"**
4. Connectez votre repository
5. Configurez :
   - **Build Command** : `cd artifacts/api-server && npm install`
   - **Start Command** : `node artifacts/api-server/dist/index.mjs`
   - Ajoutez les variables d'environnement

---

## 🎯 Configuration Complète

### Frontend (Déjà Fait ✅)
- **URL** : http://digitalsolverland.space
- **Hébergé sur** : Hostinger
- **Status** : ✅ Fonctionnel

### Backend API
- **URL** : http://digitalsolverland.space/api
- **Hébergé sur** : Hostinger (à configurer via hPanel)
- **Chemin** : `/home/u696346042/domains/digitalsolverland.space/api`

### Base de Données
- **Type** : PostgreSQL
- **Nom** : digitalecomland
- **Utilisateur** : digitalecomland_user
- **Mot de passe** : DigitalEcom2024!Secure

---

## 📞 Besoin d'Aide ?

### Logs sur le Serveur

Connectez-vous via SSH et exécutez :

```bash
ssh -p 65002 u696346042@147.93.54.128

# Voir les logs de l'API
cd /home/u696346042/domains/digitalsolverland.space/api
cat logs/*.log
```

### Tester Manuellement l'API

```bash
cd /home/u696346042/domains/digitalsolverland.space/api
node index.mjs
```

Si Node ne fonctionne pas, vérifiez le PATH :

```bash
export PATH=$HOME/.nvm/versions/node/v20.18.1/bin:$PATH
node --version
```

---

## ✅ Checklist Finale

- [ ] Frontend accessible sur digitalsolverland.space
- [ ] Application Node.js créée dans hPanel
- [ ] Variables d'environnement configurées (PORT, NODE_ENV, DATABASE_URL)
- [ ] Application démarrée (statut "Running")
- [ ] API répond sur /api/health
- [ ] Application complète fonctionnelle

---

## 🎉 Une Fois Tout Configuré

Votre application sera accessible :
- **Frontend** : http://digitalsolverland.space
- **API** : http://digitalsolverland.space/api

**L'application est maintenant en production ! 🚀**

---

## 📝 Notes Importantes

1. **Mot de passe SSH** : Changez-le après la configuration (commande `passwd`)
2. **Sauvegardes** : Configurez des sauvegardes automatiques dans hPanel
3. **SSL/HTTPS** : Activez le SSL gratuit dans hPanel pour sécuriser le site
4. **Monitoring** : Surveillez l'utilisation des ressources dans hPanel

---

## 🔒 Sécurité Post-Déploiement

1. **Activez SSL** (dans hPanel > SSL/TLS)
2. **Changez les mots de passe** (SSH, base de données)
3. **Configurez un pare-feu** (si disponible)
4. **Mettez à jour régulièrement** Node.js et les dépendances
