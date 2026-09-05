#!/usr/bin/env pwsh
# ============================================================
# Script de démarrage automatique - Digital Ecom Land
# ============================================================
# Lance l'API backend + Frontend (Admin + Vitrine) en localhost
# ============================================================

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "     DIGITAL ECOM LAND - Demarrage Automatique            " -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# ============================================================
# ÉTAPE 1 : Vérification des prérequis
# ============================================================
Write-Host "[1/5] Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installé : $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ ERREUR : Node.js n'est pas installé !" -ForegroundColor Red
    Write-Host "    Téléchargez-le ici : https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Vérifier pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Host "  ✓ pnpm installé : $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ pnpm n'est pas installé. Installation..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "  ✓ pnpm installé avec succès" -ForegroundColor Green
}

# ============================================================
# ÉTAPE 2 : Installation des dépendances
# ============================================================
Write-Host "`n[2/5] Installation des dépendances..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "  Installation des packages (première fois, peut prendre 2-3 minutes)..." -ForegroundColor Yellow
    pnpm install
    Write-Host "  ✓ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "  ✓ Dépendances déjà installées" -ForegroundColor Green
}

# ============================================================
# ÉTAPE 3 : Build de l'API Backend
# ============================================================
Write-Host "`n[3/5] Build de l'API Backend..." -ForegroundColor Yellow

Push-Location "artifacts/api-server"
try {
    pnpm run build | Out-Null
    Write-Host "  ✓ API Backend compilée" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Erreur lors du build de l'API" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# ============================================================
# ÉTAPE 4 : Configuration de l'environnement
# ============================================================
Write-Host "`n[4/5] Configuration de l'environnement..." -ForegroundColor Yellow

# Créer .env si n'existe pas
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ Fichier .env créé (à configurer si nécessaire)" -ForegroundColor Green
} else {
    Write-Host "  ✓ Fichier .env existe déjà" -ForegroundColor Green
}

# ============================================================
# ÉTAPE 5 : Démarrage des services
# ============================================================
Write-Host "`n[5/5] Démarrage des services..." -ForegroundColor Yellow

# Créer un fichier temporaire pour les logs
$apiLogFile = "api-server.log"
$frontLogFile = "frontend.log"

# Démarrer l'API Backend
Write-Host "`n  → Démarrage de l'API Backend (port 8080)..." -ForegroundColor Cyan
Push-Location "artifacts/api-server"
$apiProcess = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "pnpm run dev 2>&1 | Tee-Object -FilePath ../../$apiLogFile" -PassThru -WindowStyle Normal
Pop-Location
Start-Sleep -Seconds 3

# Démarrer le Frontend (Admin + Vitrine)
Write-Host "  → Démarrage du Frontend (port 5173)..." -ForegroundColor Cyan
Push-Location "artifacts/digital-ecom-land"
$frontProcess = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "pnpm run dev 2>&1 | Tee-Object -FilePath ../../$frontLogFile" -PassThru -WindowStyle Normal
Pop-Location
Start-Sleep -Seconds 5

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "              APPLICATION DEMARREE !                     " -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Green

Write-Host "BACKEND (API)" -ForegroundColor Cyan
Write-Host "   -> http://localhost:8080" -ForegroundColor White
Write-Host "   -> Logs : $apiLogFile`n" -ForegroundColor Gray

Write-Host "FRONTEND" -ForegroundColor Cyan
Write-Host "   -> http://localhost:5173" -ForegroundColor White
Write-Host "   -> Logs : $frontLogFile`n" -ForegroundColor Gray

Write-Host "PAGES PRINCIPALES :" -ForegroundColor Yellow
Write-Host "   Vitrine        : http://localhost:5173/" -ForegroundColor White
Write-Host "   Dashboard User : http://localhost:5173/dashboard" -ForegroundColor White
Write-Host "   Admin Panel    : http://localhost:5173/admin" -ForegroundColor Magenta
Write-Host "   Produits Admin : http://localhost:5173/admin/products" -ForegroundColor Magenta
Write-Host "   Categories     : http://localhost:5173/admin/categories" -ForegroundColor Magenta
Write-Host "   Fournisseurs   : http://localhost:5173/admin/suppliers" -ForegroundColor Magenta
Write-Host "   Affilies       : http://localhost:5173/admin/affiliates" -ForegroundColor Magenta
Write-Host "   Commandes      : http://localhost:5173/admin/orders`n" -ForegroundColor Magenta

Write-Host "ASTUCES :" -ForegroundColor Yellow
Write-Host "   - Les modifications du code rechargent automatiquement" -ForegroundColor Gray
Write-Host "   - Ctrl+C dans les terminaux pour arreter les services" -ForegroundColor Gray
Write-Host "   - Le dossier '/admin/*' est votre back-office`n" -ForegroundColor Gray

Write-Host "PROCHAINES ETAPES :" -ForegroundColor Yellow
Write-Host "   1. Ouvrez http://localhost:5173/admin pour le back-office" -ForegroundColor White
Write-Host "   2. Modifiez les fichiers dans artifacts/digital-ecom-land/src/pages/admin/" -ForegroundColor White
Write-Host "   3. Les changements s'appliquent en temps reel !`n" -ForegroundColor White

Write-Host "Appuyez sur une touche pour ouvrir l'application dans le navigateur..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Ouvrir les URLs dans le navigateur
Start-Process "http://localhost:5173"
Start-Process "http://localhost:5173/admin"

Write-Host "`nNavigateur ouvert ! Bonnes modifications !`n" -ForegroundColor Green
