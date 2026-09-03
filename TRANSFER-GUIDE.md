# 📁 Guide de Transfert des Fichiers

L'archive `digitalecomland.zip` a été créée avec succès dans `C:\Users\ferfore\AppData\Local\Temp\`

Taille: **27.11 MB**

## 🎯 Méthode Recommandée : FileZilla (Interface Graphique)

### 1. Télécharger FileZilla Client

Si vous ne l'avez pas déjà : https://filezilla-project.org/download.php?type=client

### 2. Configurer la connexion

Ouvrez FileZilla et entrez les informations suivantes dans la barre en haut :

- **Hôte** : `sftp://147.93.54.128`
- **Nom d'utilisateur** : `u696346042`
- **Mot de passe** : configurez-le uniquement dans le gestionnaire de secrets
- **Port** : `65002`

Cliquez sur **Connexion rapide**

### 3. Transférer l'archive

#### Option A : Transférer l'archive ZIP (Plus rapide)

1. Dans le panneau local (gauche), naviguez vers :
   ```
   C:\Users\ferfore\AppData\Local\Temp\
   ```

2. Trouvez le fichier `digitalecomland.zip`

3. Dans le panneau distant (droite), créez le dossier :
   ```
   /home/u696346042/
   ```

4. Glissez-déposez `digitalecomland.zip` du panneau gauche vers le panneau droit

5. Attendez que le transfert se termine (barre de progression en bas)

#### Option B : Transférer les fichiers directement (Sans compression)

1. Dans le panneau local (gauche), naviguez vers :
   ```
   C:\Users\ferfore\Desktop\new age\Desktop\Digitalecomland
   ```

2. Dans le panneau distant (droite), créez le dossier :
   ```
   /home/u696346042/digitalecomland/
   ```

3. Sélectionnez et transférez ces dossiers/fichiers :
   - `artifacts/` (TOUT le dossier)
   - `package.json`
   - `pnpm-workspace.yaml`
   - `pnpm-lock.yaml`
   - `.env.production`
   - `ecosystem.config.cjs`
   - `nginx.conf`
   - `deploy.sh`
   - `DEPLOY.md`
   - `QUICK-DEPLOY-GUIDE.md`

⚠️ **NE TRANSFÉREZ PAS** :
   - `node_modules/` (sera réinstallé sur le serveur)
   - `.git/` (pas nécessaire)
   - `.config/` (local)

---

## 🖥️ Méthode Alternative : WinSCP

### 1. Télécharger WinSCP

https://winscp.net/eng/download.php

### 2. Configurer la connexion

- **Protocole** : SFTP
- **Hôte** : `147.93.54.128`
- **Port** : `65002`
- **Nom d'utilisateur** : `u696346042`
- **Mot de passe** : configurez-le uniquement dans le gestionnaire de secrets

### 3. Transférer les fichiers

Même processus que FileZilla (glisser-déposer)

---

## 📦 Après le Transfert

### Si vous avez transféré le ZIP :

1. Connectez-vous au serveur via SSH :
```bash
ssh -p 65002 u696346042@147.93.54.128
```

2. Décompressez l'archive :
```bash
# Installer unzip si nécessaire
sudo apt install unzip -y

# Décompresser
unzip -o ~/digitalecomland.zip -d ~/digitalecomland

# Vérifier
cd ~/digitalecomland
ls -la
```

### Si vous avez transféré les fichiers directement :

1. Connectez-vous au serveur :
```bash
ssh -p 65002 u696346042@147.93.54.128
```

2. Vérifiez que tout est là :
```bash
cd ~/digitalecomland
ls -la
```

---

## 🚀 Déploiement sur le Serveur

Une fois les fichiers transférés, suivez ces étapes sur le serveur :

### 1. Installer les prérequis

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js (version 18 ou supérieure)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer pnpm
npm install -g pnpm

# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installer Nginx
sudo apt install -y nginx

# Installer PM2
npm install -g pm2
```

### 2. Configurer PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans le shell PostgreSQL :
CREATE DATABASE digitalecomland;
CREATE USER digitalecomland_user WITH PASSWORD '<HOSTINGER_DB_PASSWORD>';
GRANT ALL PRIVILEGES ON DATABASE digitalecomland TO digitalecomland_user;
\q
```

### 3. Configurer l'environnement

```bash
cd ~/digitalecomland

# Copier le fichier d'environnement
cp .env.production .env

# Éditer avec votre configuration
nano .env
```

Mettez à jour la ligne `DATABASE_URL` :
```
DATABASE_URL=postgresql://digitalecomland_user:<HOSTINGER_DB_PASSWORD>@localhost:5432/digitalecomland
```

Sauvegardez avec `CTRL+O`, puis `CTRL+X`

### 4. Déployer l'application

```bash
cd ~/digitalecomland

# Rendre le script exécutable
chmod +x deploy.sh

# Exécuter le déploiement
bash deploy.sh
```

Le script va :
- ✅ Installer toutes les dépendances
- ✅ Builder le frontend et le backend
- ✅ Configurer PM2
- ✅ Démarrer l'application

### 5. Configurer Nginx

```bash
# Copier la configuration
sudo cp ~/digitalecomland/nginx.conf /etc/nginx/sites-available/digitalecomland

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/digitalecomland /etc/nginx/sites-enabled/

# Supprimer la config par défaut si elle existe
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### 6. Vérifier que tout fonctionne

```bash
# Statut PM2
pm2 status

# Logs de l'application
pm2 logs digitalecomland-api

# Test de l'API
curl http://localhost:3001/api/health

# Vérifier Nginx
sudo systemctl status nginx
```

---

## 🌐 Accéder à l'Application

Une fois le déploiement terminé :

- **Frontend** : http://147.93.54.128
- **API** : http://147.93.54.128/api

---

## 🔒 Sécurisation Post-Déploiement

### 1. Changer le mot de passe SSH (IMPORTANT !)

```bash
passwd
```

### 2. Configurer le pare-feu

```bash
# Installer ufw
sudo apt install ufw -y

# Configurer les règles
sudo ufw allow 22/tcp      # SSH standard
sudo ufw allow 65002/tcp   # Votre port SSH personnalisé
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Activer le pare-feu
sudo ufw enable
```

### 3. Installer un certificat SSL (HTTPS)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir un certificat (remplacez par votre domaine)
sudo certbot --nginx -d votre-domaine.com
```

---

## 🔧 Commandes Utiles

```bash
# Redémarrer l'application
pm2 restart digitalecomland-api

# Voir les logs
pm2 logs

# Monitorer en temps réel
pm2 monit

# Redémarrer Nginx
sudo systemctl restart nginx

# Voir les logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## ❓ Dépannage

### L'upload échoue avec FileZilla

- Vérifiez que le port 65002 est bien ouvert
- Essayez en mode SFTP (pas FTP)
- Vérifiez les credentials

### "Permission denied" sur le serveur

```bash
# Donner les permissions appropriées
chmod 755 ~/digitalecomland
chmod +x ~/digitalecomland/deploy.sh
```

### PM2 ne démarre pas l'application

```bash
# Voir les erreurs détaillées
pm2 logs digitalecomland-api --lines 100

# Vérifier le fichier .env
cat ~/digitalecomland/.env

# Tester manuellement
cd ~/digitalecomland/artifacts/api-server
PORT=3001 node dist/index.mjs
```

### Nginx ne sert pas le site

```bash
# Vérifier la configuration
sudo nginx -t

# Voir les erreurs
sudo tail -f /var/log/nginx/error.log

# Vérifier que le chemin dans nginx.conf est correct
ls -la /home/u696346042/digitalecomland/artifacts/digital-ecom-land/dist/public/
```

---

## 📞 Besoin d'aide supplémentaire ?

Consultez :
- **DEPLOY.md** pour le guide complet de déploiement
- **QUICK-DEPLOY-GUIDE.md** pour les commandes rapides
- Les logs : `pm2 logs` et `/var/log/nginx/error.log`
