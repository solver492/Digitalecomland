# Guide de Déploiement - Digital Ecom Land

## 📋 Prérequis sur le serveur

Le serveur doit avoir installé :
- Node.js (v18 ou supérieur)
- pnpm (gestionnaire de paquets)
- Nginx (serveur web)
- PostgreSQL (base de données)
- PM2 (gestionnaire de processus Node.js)

## 🚀 Étapes de déploiement

### 1. Connexion au serveur

```bash
ssh -p 65002 u696346042@147.93.54.128
```

### 2. Créer le répertoire de l'application

```bash
mkdir -p ~/digitalecomland
cd ~/digitalecomland
```

### 3. Transférer les fichiers

Depuis votre machine locale, utilisez SCP ou SFTP :

```bash
# Depuis Windows (PowerShell)
scp -P 65002 -r "c:\Users\ferfore\Desktop\new age\Desktop\Digitalecomland\*" u696346042@147.93.54.128:~/digitalecomland/
```

Ou utilisez un client SFTP comme FileZilla :
- Host: sftp://147.93.54.128
- Port: 65002
- Username: u696346042
- Password: configure via the Hostinger secret manager; never commit it

### 4. Installer les dépendances sur le serveur

```bash
cd ~/digitalecomland

# Installer pnpm si nécessaire
npm install -g pnpm

# Installer les dépendances
pnpm install
```

### 5. Configurer l'environnement

```bash
# Copier le fichier d'environnement
cp .env.production .env

# Éditer avec vos configurations (base de données, etc.)
nano .env
```

### 6. Builder les applications

```bash
# Build du frontend
cd ~/digitalecomland/artifacts/digital-ecom-land
pnpm run build

# Build du backend
cd ~/digitalecomland/artifacts/api-server
pnpm run build
```

### 7. Installer et configurer PM2

```bash
cd ~/digitalecomland

# Installer PM2 globalement
npm install -g pm2

# Démarrer l'application
pm2 start ecosystem.config.cjs

# Sauvegarder la configuration
pm2 save

# Configurer le démarrage automatique
pm2 startup
```

### 8. Configurer Nginx

```bash
# Copier la configuration
sudo cp ~/digitalecomland/nginx.conf /etc/nginx/sites-available/digitalecomland

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/digitalecomland /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 9. Configurer PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE digitalecomland;
CREATE USER digitalecomland_user WITH PASSWORD '<HOSTINGER_DB_PASSWORD>';
GRANT ALL PRIVILEGES ON DATABASE digitalecomland TO digitalecomland_user;
\q
```

### 10. Mettre à jour le fichier .env

```bash
nano ~/digitalecomland/.env
```

Mettez à jour la ligne `DATABASE_URL` avec vos informations PostgreSQL :
```
DATABASE_URL=postgresql://digitalecomland_user:<HOSTINGER_DB_PASSWORD>@localhost:5432/digitalecomland
```

### 11. Redémarrer l'application

```bash
cd ~/digitalecomland
pm2 restart all
```

## 🔍 Vérification

Vérifiez que tout fonctionne :

```bash
# Statut PM2
pm2 status

# Logs de l'application
pm2 logs

# Test de l'API
curl http://localhost:3001/api/health

# Test du frontend
curl http://localhost:80
```

## 📱 Accès à l'application

- **Frontend**: http://147.93.54.128
- **API**: http://147.93.54.128/api

## 🔧 Commandes utiles

```bash
# Voir les logs
pm2 logs digitalecomland-api

# Redémarrer
pm2 restart digitalecomland-api

# Arrêter
pm2 stop digitalecomland-api

# Voir les processus
pm2 list

# Monitorer
pm2 monit
```

## 🔄 Mises à jour futures

Pour mettre à jour l'application :

```bash
cd ~/digitalecomland

# Récupérer les nouveaux fichiers (via SFTP)
# Puis :

# Installer les nouvelles dépendances
pnpm install

# Rebuilder
cd artifacts/digital-ecom-land && pnpm run build
cd ../api-server && pnpm run build

# Redémarrer
cd ~/digitalecomland
pm2 restart all
```

## 🔒 Sécurité

Après le déploiement, pensez à :

1. **Changer le mot de passe SSH** comme prévu
2. Configurer un firewall (ufw)
3. Installer un certificat SSL (Let's Encrypt)
4. Configurer des sauvegardes automatiques de la base de données
5. Mettre à jour régulièrement le système

```bash
# Configurer le firewall
sudo ufw allow 22/tcp
sudo ufw allow 65002/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Installer Certbot pour SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## ❓ Dépannage

### L'API ne démarre pas
```bash
pm2 logs digitalecomland-api
# Vérifier les erreurs et la configuration .env
```

### Nginx ne sert pas le frontend
```bash
sudo nginx -t
sudo systemctl status nginx
# Vérifier les chemins dans nginx.conf
```

### Problème de connexion à la base de données
```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql
# Vérifier la chaîne de connexion dans .env
```
