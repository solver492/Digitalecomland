# Script PowerShell pour transférer l'application sur le serveur
# Usage: .\upload-to-server.ps1

$SERVER_IP = "147.93.54.128"
$SERVER_PORT = "65002"
$SERVER_USER = "u696346042"
$SERVER_PATH = "/home/u696346042/digitalecomland"
$LOCAL_PATH = $PSScriptRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Upload Digital Ecom Land vers le serveur" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si SSH est disponible
try {
    Get-Command ssh -ErrorAction Stop | Out-Null
} catch {
    Write-Host "❌ SSH n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "Installez OpenSSH ou utilisez un client SFTP comme FileZilla" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Création du répertoire sur le serveur..." -ForegroundColor Blue
Write-Host "Commande: ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP} 'mkdir -p $SERVER_PATH'" -ForegroundColor Gray
Write-Host ""
ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "mkdir -p $SERVER_PATH"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la connexion SSH" -ForegroundColor Red
    Write-Host "Vérifiez vos credentials et que le serveur est accessible" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Connexion SSH réussie!" -ForegroundColor Green
Write-Host ""

# Liste des fichiers/dossiers à transférer
$itemsToUpload = @(
    "artifacts/api-server/dist",
    "artifacts/api-server/package.json",
    "artifacts/api-server/src",
    "artifacts/api-server/build.mjs",
    "artifacts/api-server/tsconfig.json",
    "artifacts/digital-ecom-land/dist",
    "artifacts/digital-ecom-land/package.json",
    "artifacts/digital-ecom-land/public",
    "artifacts/digital-ecom-land/src",
    "artifacts/digital-ecom-land/vite.config.ts",
    "artifacts/digital-ecom-land/tsconfig.json",
    "artifacts/digital-ecom-land/components.json",
    "artifacts/digital-ecom-land/index.html",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    ".env.production",
    "ecosystem.config.cjs",
    "nginx.conf",
    "deploy.sh",
    "DEPLOY.md"
)

Write-Host "📤 Transfert des fichiers..." -ForegroundColor Blue
Write-Host "Cela peut prendre quelques minutes..." -ForegroundColor Gray
Write-Host ""

$totalItems = $itemsToUpload.Count
$currentItem = 0

foreach ($item in $itemsToUpload) {
    $currentItem++
    $itemPath = Join-Path $LOCAL_PATH $item
    
    if (Test-Path $itemPath) {
        Write-Host "[$currentItem/$totalItems] Uploading: $item" -ForegroundColor Yellow
        
        # Créer le répertoire parent sur le serveur
        $parentDir = Split-Path -Parent $item
        if ($parentDir) {
            ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_IP}" "mkdir -p $SERVER_PATH/$parentDir" 2>$null
        }
        
        # Transférer le fichier/dossier
        scp -P $SERVER_PORT -r "$itemPath" "${SERVER_USER}@${SERVER_IP}:$SERVER_PATH/$parentDir/" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $item transféré" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Erreur lors du transfert de $item" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️  $item n'existe pas localement, ignoré" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Transfert terminé!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Connectez-vous au serveur:" -ForegroundColor White
Write-Host "   ssh -p $SERVER_PORT ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Allez dans le répertoire:" -ForegroundColor White
Write-Host "   cd $SERVER_PATH" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configurez l'environnement:" -ForegroundColor White
Write-Host "   cp .env.production .env" -ForegroundColor Gray
Write-Host "   nano .env" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Installez et démarrez:" -ForegroundColor White
Write-Host "   chmod +x deploy.sh" -ForegroundColor Gray
Write-Host "   bash deploy.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Consultez DEPLOY.md pour le guide complet" -ForegroundColor Cyan
Write-Host ""
