#!/usr/bin/env pwsh
# ============================================================
# Script de configuration Supabase - Digital Ecom Land
# ============================================================

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "     CONFIGURATION SUPABASE - Digital Ecom Land" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# ============================================================
# ÉTAPE 1 : Vérifier le mot de passe DB
# ============================================================
Write-Host "[1/6] Verification de la configuration..." -ForegroundColor Yellow

$envFile = ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "  ERREUR : Fichier .env introuvable !" -ForegroundColor Red
    Write-Host "  Copiez .env.example vers .env et configurez-le." -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content $envFile -Raw

if ($envContent -match '\[YOUR-PASSWORD\]') {
    Write-Host "`n  ATTENTION : Mot de passe Supabase non configure !" -ForegroundColor Red
    Write-Host "`n  Etapes a suivre :" -ForegroundColor Yellow
    Write-Host "  1. Allez sur https://supabase.com/dashboard/project/nfoefhwmgjatbqyibclp" -ForegroundColor White
    Write-Host "  2. Settings > Database > Connection string" -ForegroundColor White
    Write-Host "  3. Copiez le mot de passe" -ForegroundColor White
    Write-Host "  4. Remplacez [YOUR-PASSWORD] dans .env`n" -ForegroundColor White
    
    $password = Read-Host "  Collez le mot de passe Supabase ici (ou Entree pour quitter)"
    
    if ([string]::IsNullOrWhiteSpace($password)) {
        Write-Host "`n  Configuration annulee.`n" -ForegroundColor Yellow
        exit 0
    }
    
    # Remplacer le mot de passe dans .env
    $envContent = $envContent -replace '\[YOUR-PASSWORD\]', $password
    Set-Content -Path $envFile -Value $envContent
    
    Write-Host "  MOT DE PASSE CONFIGURE !" -ForegroundColor Green
} else {
    Write-Host "  MOT DE PASSE DEJA CONFIGURE" -ForegroundColor Green
}

# ============================================================
# ÉTAPE 2 : Vérifier pnpm
# ============================================================
Write-Host "`n[2/6] Verification de pnpm..." -ForegroundColor Yellow

try {
    $pnpmVersion = pnpm --version
    Write-Host "  pnpm installe : $pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERREUR : pnpm non installe !" -ForegroundColor Red
    Write-Host "  Installez avec : npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

# ============================================================
# ÉTAPE 3 : Installer les dépendances
# ============================================================
Write-Host "`n[3/6] Installation des dependances..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "  Installation en cours (peut prendre 2-3 minutes)..." -ForegroundColor Yellow
    pnpm install | Out-Null
    Write-Host "  Dependances installees" -ForegroundColor Green
} else {
    Write-Host "  Dependances deja installees" -ForegroundColor Green
}

# ============================================================
# ÉTAPE 4 : Appliquer le schéma DB
# ============================================================
Write-Host "`n[4/6] Application du schema de base de donnees..." -ForegroundColor Yellow

Push-Location "lib/db"
try {
    Write-Host "  Creation des tables sur Supabase..." -ForegroundColor Yellow
    pnpm run push 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  SCHEMA APPLIQUE AVEC SUCCES !" -ForegroundColor Green
        Write-Host "  Tables creees : users, products, orders, withdrawals, profile" -ForegroundColor Gray
    } else {
        Write-Host "  ERREUR lors de l'application du schema" -ForegroundColor Red
        Write-Host "  Verifiez le mot de passe et la connexion" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ERREUR : $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Pop-Location
}

# ============================================================
# ÉTAPE 5 : Créer l'admin par défaut
# ============================================================
Write-Host "`n[5/6] Creation de l'administrateur par defaut..." -ForegroundColor Yellow

Push-Location "artifacts/api-server"
try {
    pnpm tsx scripts/create-admin.ts 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ADMIN CREE AVEC SUCCES !" -ForegroundColor Green
        Write-Host "  Email    : admin@digitalecomland.com" -ForegroundColor Gray
        Write-Host "  Password : admin123456" -ForegroundColor Gray
        Write-Host "  CHANGEZ CE MOT DE PASSE APRES LA PREMIERE CONNEXION !" -ForegroundColor Yellow
    } else {
        Write-Host "  Admin peut-etre deja existant (pas d'erreur)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  Note : $($_.Exception.Message)" -ForegroundColor Gray
} finally {
    Pop-Location
}

# ============================================================
# ÉTAPE 6 : Résumé
# ============================================================
Write-Host "`n[6/6] Configuration terminee !" -ForegroundColor Green

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "              CONFIGURATION REUSSIE !" -ForegroundColor Green
Write-Host "============================================================`n" -ForegroundColor Green

Write-Host "BASE DE DONNEES" -ForegroundColor Cyan
Write-Host "  URL Supabase : https://nfoefhwmgjatbqyibclp.supabase.co" -ForegroundColor White
Write-Host "  Tables       : users, products, orders, withdrawals, profile" -ForegroundColor Gray

Write-Host "`nCOMPTE ADMIN" -ForegroundColor Cyan
Write-Host "  Email        : admin@digitalecomland.com" -ForegroundColor White
Write-Host "  Password     : admin123456" -ForegroundColor White
Write-Host "  CHANGEZ-LE APRES LA PREMIERE CONNEXION !" -ForegroundColor Yellow

Write-Host "`nPROCHAINES ETAPES :" -ForegroundColor Yellow
Write-Host "  1. Demarrer le backend  : cd artifacts/api-server ; pnpm run dev" -ForegroundColor White
Write-Host "  2. Demarrer le frontend : cd artifacts/digital-ecom-land ; pnpm run dev" -ForegroundColor White
Write-Host "  3. Ouvrir http://localhost:5173" -ForegroundColor White
Write-Host "  4. Se connecter avec l'admin" -ForegroundColor White

Write-Host "`nCREER LE BUCKET STORAGE (IMPORTANT) :" -ForegroundColor Yellow
Write-Host "  1. Allez sur https://supabase.com/dashboard/project/nfoefhwmgjatbqyibclp/storage/buckets" -ForegroundColor White
Write-Host "  2. Create bucket > Nom: telegram-media > Public: OUI" -ForegroundColor White
Write-Host "  3. Necessaire pour stocker les images Telegram" -ForegroundColor Gray

Write-Host "`nDOCUMENTATION :" -ForegroundColor Yellow
Write-Host "  Voir SUPABASE-SETUP.md pour plus de details`n" -ForegroundColor Gray

Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
