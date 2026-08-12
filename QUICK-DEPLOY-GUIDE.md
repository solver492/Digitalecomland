# 🚀 Guide Rapide de Déploiement

## Option 1 : Avec le script PowerShell (Recommandé sur Windows)

### 1. Exécuter le script d'upload

```powershell
.\upload-to-server.ps1
```

Le script vous demandera le mot de passe SSH plusieurs fois pendant le transfert.

### 2. Se connecter au serveur

```bash
ssh -p 65002 u696346042@147.93.54.128
```

### 3. Naviguer vers le dossier

```bash
cd ~/digitalecomland
```

### 4. Configurer l'environnement

```bash
# Copier le fichier d'environnement
cp .env.production .env

# Éditer avec vos informations de base de données
nano .env
```

Configurez votre `DATABASE_URL` PostgreSQL :
```
DATABASE_URL=postgresql://votre_user:votre_password@localhost:5432/digitalecomland
```

### 5. Exécuter le script de déploiement

```bash
chmod +x deploy.sh
bash deploy.sh
```

Le script va :
- ✅ Installer les dépendances
- ✅ Builder les applications
- ✅ Configurer PM2
- ✅ Démarrer l'application

### 6. Configurer Nginx

```bash
# Copier la configuration
sudo cp nginx.conf /etc/nginx/sites-available/digitalecomland

# Activer le site
sudo ln -s /etc/nginx/sites-available/digitalecomland /etc/nginx/sites-enabled/

# Tester
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

---

## Option 2 : Avec FileZilla (Interface graphique)

### 1. Ouvrir FileZilla

### 2. Configurer la connexion

- **Hôte**: `sftp://147.93.54.128`
- **Port**: `65002`
- **Nom d'utilisateur**: `u696346042`
- **Mot de passe**: `Dagdag676@`

### 3. Transférer les fichiers

- Glissez-déposez tout le contenu du dossier vers `/home/u696346042/digitalecomland/`
- ⚠️ **N'uploadez PAS** les dossiers `node_modules`, `.git`, `.config`

### 4. Suivre les étapes 2-6 de l'Option 1

---

## Option 3 : Avec Git (Si vous avez un dépôt)

### 1. Pousser le code sur Git

```bash
git add .
git commit -m "Production build"
git push origin main
```

### 2. Cloner sur le serveur

```bash
ssh -p 65002 u696346042@147.93.54.128
cd ~
git clone votre-repo-url digitalecomland
cd digitalecomland
```

### 3. Suivre les étapes 4-6 de l'Option 1

---

## ⚡ Vérification rapide

Après le déploiement :

```bash
# Vérifier le statut PM2
pm2 status

# Vérifier les logs
pm2 logs

# Tester l'API
curl http://localhost:3001/api/health
```

## 🌐 Accès à l'application

- **Frontend**: http://147.93.54.128
- **API**: http://147.93.54.128/api

---

## 🔧 Commandes utiles

```bash
# Voir les logs en temps réel
pm2 logs digitalecomland-api

# Redémarrer l'application
pm2 restart digitalecomland-api

# Arrêter l'application
pm2 stop digitalecomland-api

# Voir la consommation
pm2 monit
```

---

## 🆘 Problèmes courants

### "Permission denied" lors de l'upload
- Vérifiez que vous avez les droits sur le dossier distant
- Essayez : `ssh -p 65002 u696346042@147.93.54.128 "chmod 755 ~/digitalecomland"`

### "Connection refused"
- Vérifiez que le port SSH 65002 est bien ouvert
- Testez : `telnet 147.93.54.128 65002`

### L'API ne démarre pas
- Vérifiez les logs : `pm2 logs`
- Vérifiez le fichier .env
- Vérifiez que PostgreSQL est installé et tourne

### Nginx ne sert pas le site
- Vérifiez : `sudo nginx -t`
- Vérifiez les logs : `sudo tail -f /var/log/nginx/error.log`
- Vérifiez les permissions du dossier dist

---

## 📞 Besoin d'aide ?

Consultez le fichier **DEPLOY.md** pour le guide complet avec toutes les commandes détaillées.
