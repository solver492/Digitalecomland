#!/bin/bash
# Script de déploiement automatique pour Ubuntu VPS
# À exécuter directement sur le serveur

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================================================"
echo "   🚀 DÉPLOIEMENT AUTOMATIQUE - DIGITAL ECOM LAND"
echo "======================================================================"
echo ""

# Configuration
APP_DIR="/home/redsky/digitalecomland"
DB_NAME="digitalecomland"
DB_USER="digitalecomland_user"
DB_PASS="${HOSTINGER_DB_PASSWORD:?Set HOSTINGER_DB_PASSWORD in the environment}"
API_PORT="3001"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "${BLUE}[1/12]${NC} Mise à jour du système..."
sudo apt update -qq
echo -e "${GREEN}✓${NC} Système mis à jour"

echo -e "${BLUE}[2/12]${NC} Installation de Node.js 20.x..."
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js déjà installé ($(node --version))"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✓${NC} Node.js installé"
fi

echo -e "${BLUE}[3/12]${NC} Installation de pnpm et PM2..."
sudo npm install -g pnpm pm2 --silent
echo -e "${GREEN}✓${NC} pnpm et PM2 installés"

echo -e "${BLUE}[4/12]${NC} Installation de PostgreSQL..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL déjà installé"
else
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    echo -e "${GREEN}✓${NC} PostgreSQL installé"
fi

echo -e "${BLUE}[5/12]${NC} Installation de Nginx..."
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✓${NC} Nginx déjà installé"
else
    sudo apt install -y nginx unzip
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo -e "${GREEN}✓${NC} Nginx installé"
fi

echo -e "${BLUE}[6/12]${NC} Création du répertoire de l'application..."
mkdir -p $APP_DIR
cd $APP_DIR
echo -e "${GREEN}✓${NC} Répertoire créé: $APP_DIR"

echo -e "${BLUE}[7/12]${NC} Configuration de PostgreSQL..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo -e "${GREEN}✓${NC} Base de données configurée"

echo -e "${BLUE}[8/12]${NC} Téléchargement de l'application..."
echo -e "${YELLOW}ℹ${NC}  Vous devez transférer les fichiers depuis votre machine locale"
echo -e "${YELLOW}ℹ${NC}  Utilisez SCP ou SFTP pour copier l'archive vers $APP_DIR"
echo ""
echo "  Depuis votre machine Windows:"
echo "  scp -P 22 deploy_package.zip redsky@100.78.217.97:$APP_DIR/"
echo ""
read -p "Appuyez sur Entrée une fois les fichiers transférés..."

if [ -f "$APP_DIR/deploy_package.zip" ]; then
    echo -e "${BLUE}[9/12]${NC} Décompression de l'application..."
    unzip -o deploy_package.zip
    echo -e "${GREEN}✓${NC} Application décompressée"
else
    echo -e "${RED}✗${NC} Fichier deploy_package.zip non trouvé"
    echo -e "${YELLOW}ℹ${NC}  Création de la structure de base..."
    mkdir -p artifacts/api-server/dist
    mkdir -p artifacts/digital-ecom-land/dist/public
fi

echo -e "${BLUE}[10/12]${NC} Configuration des variables d'environnement..."
cat > $APP_DIR/.env << EOFENV
PORT=$API_PORT
NODE_ENV=production
API_PORT=$API_PORT
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
VITE_API_URL=http://$SERVER_IP:$API_PORT
EOFENV
echo -e "${GREEN}✓${NC} Variables d'environnement configurées"

echo -e "${BLUE}[11/12]${NC} Installation des dépendances et build..."
if [ -f "package.json" ]; then
    pnpm install 2>&1 | grep -v "deprecated" || true
    
    if [ -d "artifacts/digital-ecom-land" ]; then
        cd artifacts/digital-ecom-land
        pnpm run build 2>&1 | tail -20
        cd ../..
    fi
    
    if [ -d "artifacts/api-server" ]; then
        cd artifacts/api-server
        pnpm run build 2>&1 | tail -20
        cd ../..
    fi
    
    echo -e "${GREEN}✓${NC} Build terminé"
else
    echo -e "${YELLOW}⚠${NC}  Pas de package.json trouvé"
fi

echo -e "${BLUE}[12/12]${NC} Configuration de Nginx..."
sudo tee /etc/nginx/sites-available/digitalecomland > /dev/null << EOFNGINX
server {
    listen 80;
    listen [::]:80;
    server_name $SERVER_IP;

    root $APP_DIR/artifacts/digital-ecom-land/dist/public;
    index index.html;

    # Frontend - SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOFNGINX

sudo ln -sf /etc/nginx/sites-available/digitalecomland /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
echo -e "${GREEN}✓${NC} Nginx configuré"

echo -e "${BLUE}[PM2]${NC} Démarrage de l'application..."
pm2 delete digitalecomland-api 2>/dev/null || true

if [ -f "ecosystem.config.cjs" ]; then
    pm2 start ecosystem.config.cjs
else
    pm2 start artifacts/api-server/dist/index.mjs --name digitalecomland-api
fi

pm2 save
pm2 startup | tail -1 | bash
echo -e "${GREEN}✓${NC} Application démarrée"

sleep 3

echo ""
echo "======================================================================"
echo -e "${GREEN}   ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
echo "======================================================================"
echo ""
echo -e "${BLUE}🌐 Votre application est accessible sur:${NC}"
echo "  • Frontend: http://$SERVER_IP"
echo "  • API:      http://$SERVER_IP/api"
echo ""
echo -e "${BLUE}📊 Services installés:${NC}"
echo "  ✓ Node.js $(node --version)"
echo "  ✓ pnpm $(pnpm --version)"
echo "  ✓ PM2"
echo "  ✓ PostgreSQL"
echo "  ✓ Nginx"
echo ""
echo -e "${BLUE}🔧 Commandes utiles:${NC}"
echo "  pm2 status        - Voir le statut"
echo "  pm2 logs          - Voir les logs"
echo "  pm2 restart all   - Redémarrer"
echo "  pm2 monit         - Monitorer"
echo ""
echo -e "${YELLOW}⚠  IMPORTANT: Changez le mot de passe maintenant !${NC}"
echo "   Commande: passwd"
echo ""
