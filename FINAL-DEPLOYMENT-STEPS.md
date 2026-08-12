# 🎯 Étapes Finales de Déploiement

## 📦 Résumé de ce qui a été préparé

✅ **Application buildée** pour la production
✅ **Archive créée**: `C:\Users\ferfore\AppData\Local\Temp\digitalecomland.zip` (27.11 MB)
✅ **Fichiers de configuration** prêts
✅ **Scripts de déploiement** créés

---

## 🚀 Étapes à Suivre (Dans l'ordre)

### Étape 1️⃣ : Transférer les Fichiers sur le Serveur

#### Option A : Utiliser FileZilla (Recommandé - Interface Graphique)

1. **Télécharger FileZilla** : https://filezilla-project.org/download.php?type=client

2. **Se connecter au serveur** :
   - Hôte : `sftp://147.93.54.128`
   - Utilisateur : `u696346042`
   - Mot de passe : `Dagdag676@`
   - Port : `65002`

3. **Transférer l'archive** :
   - Local : `C:\Users\ferfore\AppData\Local\Temp\digitalecomland.zip`
   - Distant : `/home/u696346042/digitalecomland.zip`
   
   Glissez-déposez le fichier ZIP du panneau gauche vers le panneau droit

4. **Attendre** que le transfert se termine (27 MB peut prendre 2-5 minutes)

#### Option B : Utiliser WinSCP

- Protocole : SFTP
- Hôte : `147.93.54.128`
- Port : `65002`
- Utilisateur : `u696346042`
- Mot de passe : `Dagdag676@`

Transférez le fichier ZIP de la même manière.

---

### Étape 2️⃣ : Se Connecter au Serveur

Ouvrez PowerShell ou Windows Terminal et exécutez :

```bash
ssh -p 65002 u696346042@147.93.54.128
```

Entrez le mot de passe : `Dagdag676@`

---

### Étape 3️⃣ : Décompresser l'Archive

Une fois connecté au serveur :

```bash
# Installer unzip si nécessaire
sudo apt update
sudo apt install unzip -y

# Créer le répertoire
mkdir -p ~/digitalecomland

# Décompresser
unzip -o ~/digitalecomland.zip -d ~/digitalecomland

# Vérifier
cd ~/digitalecomland
ls -la
```

Vous devriez voir :
- `artifacts/`
- `package.json`
- `ecosystem.config.cjs`
- `nginx.conf`
- `deploy.sh`
- `server-setup.sh`
- etc.

---

### Étape 4️⃣ : Exécuter le Script de Configuration Automatique

Ce script va tout installer et configurer automatiquement :

```bash
cd ~/digitalecomland

# Rendre le script exécutable
chmod +x server-setup.sh

# Lancer le script
bash server-setup.sh
```

Le script va :
1. ✅ Installer Node.js, pnpm, PostgreSQL, Nginx, PM2
2. ✅ Configurer l'environnement
3. ✅ Installer les dépendances
4. ✅ Builder l'application
5. ✅ Démarrer avec PM2
6. ✅ Configurer Nginx

**IMPORTANT** : Le script va s'arrêter pour vous demander de configurer PostgreSQL et le fichier `.env`

---

### Étape 5️⃣ : Configurer PostgreSQL (Quand le script le demande)

Ouvrez un nouvel onglet/terminal SSH et exécutez :

```bash
sudo -u postgres psql
```

Dans le shell PostgreSQL, exécutez :

```sql
CREATE DATABASE digitalecomland;
CREATE USER digitalecomland_user WITH PASSWORD 'MotDePasseSecurise123!';
GRANT ALL PRIVILEGES ON DATABASE digitalecomland TO digitalecomland_user;
\q
```

Retournez dans le terminal où tourne le script et appuyez sur **Entrée**.

---

### Étape 6️⃣ : Configurer le Fichier .env (Quand le script le demande)

Le script va vous demander d'éditer le fichier `.env` :

```bash
nano ~/digitalecomland/.env
```

Modifiez la ligne `DATABASE_URL` avec le mot de passe que vous avez choisi :

```env
DATABASE_URL=postgresql://digitalecomland_user:MotDePasseSecurise123!@localhost:5432/digitalecomland
```

Sauvegardez avec `CTRL+O`, puis `CTRL+X`

Retournez dans le terminal du script et appuyez sur **Entrée**.

---

### Étape 7️⃣ : Vérifier que Tout Fonctionne

Une fois le script terminé, vérifiez :

```bash
# Statut PM2
pm2 status

# Logs de l'application
pm2 logs digitalecomland-api

# Test de l'API
curl http://localhost:3001/api/health

# Statut Nginx
sudo systemctl status nginx
```

---

## 🌐 Accéder à l'Application

Ouvrez votre navigateur et allez sur :

- **Frontend** : http://147.93.54.128
- **API** : http://147.93.54.128/api

---

## 🔒 IMPORTANT : Sécuriser le Serveur

### 1. Changer le Mot de Passe SSH (À FAIRE IMMÉDIATEMENT)

```bash
passwd
```

Entrez un nouveau mot de passe fort.

### 2. Configurer le Pare-feu

```bash
# Installer et configurer ufw
sudo apt install ufw -y

# Autoriser les ports nécessaires
sudo ufw allow 22/tcp      # SSH standard
sudo ufw allow 65002/tcp   # Votre port SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS (pour plus tard)

# Activer
sudo ufw enable

# Vérifier
sudo ufw status
```

### 3. (Optionnel) Installer un Certificat SSL pour HTTPS

Si vous avez un nom de domaine :

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir un certificat
sudo certbot --nginx -d votre-domaine.com
```

---

## 🔧 Commandes Utiles

### Gestion de l'Application

```bash
# Voir les logs en temps réel
pm2 logs digitalecomland-api

# Redémarrer l'application
pm2 restart digitalecomland-api

# Arrêter l'application
pm2 stop digitalecomland-api

# Démarrer l'application
pm2 start digitalecomland-api

# Voir la consommation de ressources
pm2 monit

# Sauvegarder la configuration PM2
pm2 save
```

### Gestion de Nginx

```bash
# Tester la configuration
sudo nginx -t

# Recharger la configuration
sudo systemctl reload nginx

# Redémarrer Nginx
sudo systemctl restart nginx

# Voir les logs d'erreur
sudo tail -f /var/log/nginx/error.log

# Voir les logs d'accès
sudo tail -f /var/log/nginx/access.log
```

### Gestion de PostgreSQL

```bash
# Se connecter à la base
psql -U digitalecomland_user -d digitalecomland

# Backup de la base de données
pg_dump -U digitalecomland_user digitalecomland > backup.sql

# Restaurer un backup
psql -U digitalecomland_user digitalecomland < backup.sql
```

---

## 📊 Monitoring

### Voir les Logs de l'Application

```bash
# Logs PM2
pm2 logs --lines 100

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Consommation de Ressources

```bash
# Utilisation CPU/Mémoire
pm2 monit

# Espace disque
df -h

# Mémoire
free -h

# Processus
htop
```

---

## 🆘 Dépannage

### L'application ne démarre pas

```bash
# Voir les logs détaillés
pm2 logs digitalecomland-api --lines 200

# Vérifier le fichier .env
cat ~/digitalecomland/.env

# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Tester la connexion à la base
psql -U digitalecomland_user -d digitalecomland -c "SELECT 1;"
```

### Nginx ne sert pas le site

```bash
# Vérifier la configuration
sudo nginx -t

# Voir les erreurs
sudo tail -f /var/log/nginx/error.log

# Vérifier les permissions
ls -la /home/u696346042/digitalecomland/artifacts/digital-ecom-land/dist/public/

# Donner les permissions si nécessaire
chmod 755 /home/u696346042
chmod -R 755 /home/u696346042/digitalecomland
```

### "Connection refused" lors de l'accès

```bash
# Vérifier que l'API tourne
pm2 status

# Vérifier que Nginx tourne
sudo systemctl status nginx

# Vérifier les ports ouverts
sudo netstat -tulpn | grep -E ':(80|3001)'

# Vérifier le pare-feu
sudo ufw status
```

### Erreur de base de données

```bash
# Vérifier que PostgreSQL tourne
sudo systemctl status postgresql

# Redémarrer PostgreSQL
sudo systemctl restart postgresql

# Vérifier les logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

---

## 🔄 Mises à Jour Futures

Pour mettre à jour l'application plus tard :

1. **Sur votre machine locale** : Faire les modifications, rebuilder, créer une nouvelle archive

2. **Transférer** la nouvelle archive sur le serveur

3. **Sur le serveur** :
```bash
cd ~/digitalecomland

# Backup de la configuration actuelle
cp .env .env.backup

# Décompresser la nouvelle version
unzip -o ~/digitalecomland-new.zip -d ~/digitalecomland

# Restaurer la config
cp .env.backup .env

# Redéployer
bash deploy.sh
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **TRANSFER-GUIDE.md** : Guide détaillé de transfert des fichiers
- **DEPLOY.md** : Documentation complète de déploiement
- **QUICK-DEPLOY-GUIDE.md** : Guide rapide des commandes

---

## ✅ Checklist Finale

- [ ] Fichiers transférés sur le serveur (via FileZilla/WinSCP)
- [ ] Script `server-setup.sh` exécuté avec succès
- [ ] PostgreSQL configuré
- [ ] Fichier `.env` configuré avec le bon `DATABASE_URL`
- [ ] PM2 tourne et l'application est démarrée
- [ ] Nginx configuré et le site est accessible
- [ ] Mot de passe SSH changé
- [ ] Pare-feu configuré
- [ ] Tests effectués (frontend et API fonctionnent)

---

## 🎉 Félicitations !

Votre application **Digital Ecom Land** est maintenant déployée en production !

**Accédez-y sur** : http://147.93.54.128
