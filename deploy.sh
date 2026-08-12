#!/bin/bash
# Script de déploiement pour Digital Ecom Land
# Usage: bash deploy.sh

set -e

echo "========================================="
echo "Déploiement Digital Ecom Land"
echo "========================================="

# Variables
APP_DIR="/home/u696346042/digitalecomland"
USER="u696346042"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Installation des dépendances...${NC}"
cd "$APP_DIR"
pnpm install --prod=false

echo -e "${BLUE}🔨 Build du frontend...${NC}"
cd "$APP_DIR/artifacts/digital-ecom-land"
pnpm run build

echo -e "${BLUE}🔨 Build du backend...${NC}"
cd "$APP_DIR/artifacts/api-server"
pnpm run build

echo -e "${BLUE}📁 Création du dossier logs...${NC}"
mkdir -p "$APP_DIR/logs"

echo -e "${BLUE}🔄 Redémarrage de PM2...${NC}"
cd "$APP_DIR"

# Vérifier si PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo -e "${BLUE}📦 Installation de PM2...${NC}"
    npm install -g pm2
fi

# Arrêter l'application si elle tourne
pm2 stop digitalecomland-api 2>/dev/null || true
pm2 delete digitalecomland-api 2>/dev/null || true

# Démarrer avec PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
echo "Application disponible sur:"
echo "  - Frontend: http://147.93.54.128"
echo "  - API: http://147.93.54.128/api"
echo ""
echo "Commandes utiles:"
echo "  - pm2 status          : Voir le statut"
echo "  - pm2 logs            : Voir les logs"
echo "  - pm2 restart all     : Redémarrer"
