#!/bin/bash
# Script de configuration complète du serveur
# À exécuter sur le serveur après le transfert des fichiers

set -e  # Arrêter en cas d'erreur

echo "========================================="
echo "Configuration du Serveur - Digital Ecom Land"
echo "========================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Vérifier si on est sur le bon système
info "Vérification du système..."
if ! command -v apt &> /dev/null; then
    error "Ce script est conçu pour Ubuntu/Debian"
    exit 1
fi
success "Système compatible détecté"

# Mise à jour du système
info "Mise à jour du système..."
sudo apt update -qq
success "Système mis à jour"

# Installation de Node.js
info "Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    info "Installation de Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    success "Node.js installé"
else
    NODE_VERSION=$(node -v)
    success "Node.js déjà installé: $NODE_VERSION"
fi

# Installation de pnpm
info "Vérification de pnpm..."
if ! command -v pnpm &> /dev/null; then
    info "Installation de pnpm..."
    sudo npm install -g pnpm
    success "pnpm installé"
else
    PNPM_VERSION=$(pnpm -v)
    success "pnpm déjà installé: $PNPM_VERSION"
fi

# Installation de PostgreSQL
info "Vérification de PostgreSQL..."
if ! command -v psql &> /dev/null; then
    info "Installation de PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    success "PostgreSQL installé et démarré"
else
    success "PostgreSQL déjà installé"
fi

# Installation de Nginx
info "Vérification de Nginx..."
if ! command -v nginx &> /dev/null; then
    info "Installation de Nginx..."
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    success "Nginx installé et démarré"
else
    success "Nginx déjà installé"
fi

# Installation de PM2
info "Vérification de PM2..."
if ! command -v pm2 &> /dev/null; then
    info "Installation de PM2..."
    sudo npm install -g pm2
    success "PM2 installé"
else
    success "PM2 déjà installé"
fi

# Installation d'unzip (pour décompresser l'archive)
info "Installation des utilitaires..."
sudo apt install -y unzip curl git -qq
success "Utilitaires installés"

echo ""
success "=== Installation des prérequis terminée ==="
echo ""

# Configuration de PostgreSQL
echo "========================================="
echo "Configuration de la Base de Données"
echo "========================================="
echo ""

warning "Configuration de PostgreSQL requise !"
echo ""
echo "Vous devez créer manuellement la base de données:"
echo ""
echo "sudo -u postgres psql"
echo "CREATE DATABASE digitalecomland;"
echo "CREATE USER digitalecomland_user WITH PASSWORD 'VotreMotDePasseSecurise123!';"
echo "GRANT ALL PRIVILEGES ON DATABASE digitalecomland TO digitalecomland_user;"
echo "\\q"
echo ""

read -p "Appuyez sur Entrée après avoir créé la base de données..."

# Configuration de l'application
echo ""
echo "========================================="
echo "Configuration de l'Application"
echo "========================================="
echo ""

APP_DIR="/home/$(whoami)/digitalecomland"

if [ ! -d "$APP_DIR" ]; then
    error "Le répertoire $APP_DIR n'existe pas"
    error "Veuillez d'abord transférer les fichiers"
    exit 1
fi

cd "$APP_DIR"
success "Répertoire de l'application trouvé: $APP_DIR"

# Vérifier si l'archive existe et la décompresser
if [ -f "$HOME/digitalecomland.zip" ]; then
    info "Décompression de l'archive..."
    unzip -o "$HOME/digitalecomland.zip" -d "$APP_DIR"
    success "Archive décompressée"
fi

# Configuration du fichier .env
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        info "Copie du fichier .env.production vers .env..."
        cp .env.production .env
        success "Fichier .env créé"
        warning "IMPORTANT: Vous devez éditer le fichier .env !"
        warning "Exécutez: nano .env"
        warning "Et configurez votre DATABASE_URL"
        echo ""
        read -p "Appuyez sur Entrée après avoir configuré .env..."
    else
        error "Fichier .env.production non trouvé"
        exit 1
    fi
else
    success "Fichier .env existe déjà"
fi

# Installation des dépendances
echo ""
info "Installation des dépendances..."
pnpm install --prod=false

success "Dépendances installées"

# Build de l'application
echo ""
info "Build du frontend..."
cd "$APP_DIR/artifacts/digital-ecom-land"
pnpm run build
success "Frontend buildé"

echo ""
info "Build du backend..."
cd "$APP_DIR/artifacts/api-server"
pnpm run build
success "Backend buildé"

# Création du dossier logs
cd "$APP_DIR"
mkdir -p logs
success "Dossier logs créé"

# Configuration de PM2
echo ""
info "Configuration de PM2..."

# Arrêter l'application si elle tourne déjà
pm2 stop digitalecomland-api 2>/dev/null || true
pm2 delete digitalecomland-api 2>/dev/null || true

# Démarrer avec PM2
pm2 start ecosystem.config.cjs
pm2 save

# Configuration du démarrage automatique
pm2 startup > /tmp/pm2_startup.txt 2>&1 || true
if grep -q "sudo" /tmp/pm2_startup.txt; then
    warning "Pour activer le démarrage automatique, exécutez:"
    cat /tmp/pm2_startup.txt | grep "sudo env"
fi

success "PM2 configuré et application démarrée"

# Configuration de Nginx
echo ""
info "Configuration de Nginx..."

# Vérifier que le fichier nginx.conf existe
if [ ! -f "$APP_DIR/nginx.conf" ]; then
    error "Fichier nginx.conf non trouvé"
    exit 1
fi

# Copier la configuration
sudo cp "$APP_DIR/nginx.conf" /etc/nginx/sites-available/digitalecomland

# Créer le lien symbolique
sudo ln -sf /etc/nginx/sites-available/digitalecomland /etc/nginx/sites-enabled/digitalecomland

# Supprimer la config par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
info "Test de la configuration Nginx..."
if sudo nginx -t; then
    success "Configuration Nginx valide"
    info "Redémarrage de Nginx..."
    sudo systemctl restart nginx
    success "Nginx redémarré"
else
    error "Erreur dans la configuration Nginx"
    exit 1
fi

# Vérification finale
echo ""
echo "========================================="
echo "Vérification du Déploiement"
echo "========================================="
echo ""

info "Statut PM2:"
pm2 status

echo ""
info "Statut Nginx:"
sudo systemctl status nginx --no-pager | head -n 10

echo ""
info "Test de l'API..."
sleep 3
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    success "API répond correctement"
else
    warning "L'API ne répond pas encore (peut prendre quelques secondes)"
fi

echo ""
echo "========================================="
success "Déploiement Terminé !"
echo "========================================="
echo ""

# Afficher les informations de connexion
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Votre application est accessible sur:"
echo ""
echo "  - Frontend: http://$SERVER_IP"
echo "  - API:      http://$SERVER_IP/api"
echo ""
echo "Commandes utiles:"
echo ""
echo "  pm2 logs              - Voir les logs"
echo "  pm2 status            - Statut des applications"
echo "  pm2 restart all       - Redémarrer"
echo "  pm2 monit             - Monitorer en temps réel"
echo ""
echo "  sudo systemctl status nginx  - Statut Nginx"
echo "  sudo nginx -t                - Tester la config Nginx"
echo ""
warning "N'oubliez pas de changer votre mot de passe SSH !"
warning "Exécutez: passwd"
echo ""
