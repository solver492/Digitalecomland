#!/bin/bash
# Script à exécuter sur le serveur Ubuntu pour déployer depuis GitHub

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================================================"
echo "   🚀 DÉPLOIEMENT DEPUIS GITHUB - DIGITAL ECOM LAND"
echo "======================================================================"

APP_DIR="/home/redsky/digitalecomland"
GITHUB_REPO="https://github.com/solver492/digitalecomlando.git"
DB_NAME="digitalecomland"
DB_USER="digitalecomland_user"
DB_PASS="${HOSTINGER_DB_PASSWORD:?Set HOSTINGER_DB_PASSWORD in the environment}"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "${BLUE}[1/10]${NC} Mise à jour système..."
sudo apt update -qq
sudo apt install -y git curl unzip
echo -e "${GREEN}✓${NC} OK"

echo -e "${BLUE}[2/10]${NC} Installation Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

echo -e "${BLUE}[3/10]${NC} Installation pnpm & PM2..."
sudo npm install -g pnpm pm2 --silent
echo -e "${GREEN}✓${NC} OK"

echo -e "${BLUE}[4/10]${NC} Installation PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi
echo -e "${GREEN}✓${NC} OK"

echo -e "${BLUE}[5/10]${NC} Installation Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi
echo -e "${GREEN}✓${NC} OK"

echo -e "${BLUE}[6/10]${NC} Clonage du repository GitHub..."
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}ℹ${NC} Répertoire existe, mise à jour..."
    cd $APP_DIR
    git pull
else
    git clone $GITHUB_REPO $APP_DIR
    cd $APP_DIR
fi
echo -e "${GREEN}✓${NC} Code récupéré"

echo -e "${BLUE}[7/10]${NC} Configuration PostgreSQL..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
echo -e "${GREEN}✓${NC} Base de données OK"

echo -e "${BLUE}[8/10]${NC} Configuration .env..."
cat > .env << EOFENV
PORT=3001
NODE_ENV=production
API_PORT=3001
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
VITE_API_URL=http://$SERVER_IP:3001
EOFENV
echo -e "${GREEN}✓${NC} Variables OK"

echo -e "${BLUE}[9/10]${NC} Installation & Build (3-5 min)..."
pnpm install 2>&1 | grep -E "(Progress|Done)" || true
cd artifacts/digital-ecom-land && pnpm run build 2>&1 | tail -10
cd ../api-server && pnpm run build 2>&1 | tail -10
cd ../..
echo -e "${GREEN}✓${NC} Build OK"

echo -e "${BLUE}[10/10]${NC} Configuration Nginx & PM2..."
sudo tee /etc/nginx/sites-available/digitalecomland > /dev/null << 'EOFNGINX'
server {
    listen 80;
    server_name _;
    root /home/redsky/digitalecomland/artifacts/digital-ecom-land/dist/public;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOFNGINX

sudo ln -sf /etc/nginx/sites-available/digitalecomland /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

pm2 delete digitalecomland-api 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | tail -1 | bash

echo -e "${GREEN}✓${NC} Démarré"

sleep 2

echo ""
echo "======================================================================"
echo -e "${GREEN}   ✅ DÉPLOIEMENT TERMINÉ !${NC}"
echo "======================================================================"
echo ""
echo -e "${BLUE}🌐 Application accessible:${NC}"
echo "  • Frontend: http://$SERVER_IP"
echo "  • API:      http://$SERVER_IP/api"
echo ""
echo -e "${BLUE}🔧 Commandes:${NC}"
echo "  pm2 status / pm2 logs / pm2 restart all"
echo ""
echo -e "${YELLOW}⚠  Changez le mot de passe: passwd${NC}"
echo ""
