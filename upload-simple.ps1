# Script simple d'upload - Version alternative
# Ce script crée une archive et l'upload

$SERVER = "u696346042@147.93.54.128"
$PORT = "65002"
$REMOTE_PATH = "/home/u696346042/digitalecomland"

Write-Host "[INFO] Creation de l'archive..." -ForegroundColor Blue

# Créer un dossier temporaire
$tempDir = Join-Path $env:TEMP "digitalecomland-deploy"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copier les fichiers nécessaires
Write-Host "[INFO] Copie des fichiers..." -ForegroundColor Blue

# Structure des artifacts
New-Item -ItemType Directory -Path "$tempDir/artifacts/api-server" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir/artifacts/digital-ecom-land" -Force | Out-Null

# API Server
Copy-Item -Recurse "artifacts/api-server/dist" "$tempDir/artifacts/api-server/" -Force
Copy-Item "artifacts/api-server/package.json" "$tempDir/artifacts/api-server/" -Force
Copy-Item "artifacts/api-server/build.mjs" "$tempDir/artifacts/api-server/" -Force
Copy-Item "artifacts/api-server/tsconfig.json" "$tempDir/artifacts/api-server/" -Force
Copy-Item -Recurse "artifacts/api-server/src" "$tempDir/artifacts/api-server/" -Force

# Frontend
Copy-Item -Recurse "artifacts/digital-ecom-land/dist" "$tempDir/artifacts/digital-ecom-land/" -Force
Copy-Item "artifacts/digital-ecom-land/package.json" "$tempDir/artifacts/digital-ecom-land/" -Force
Copy-Item "artifacts/digital-ecom-land/vite.config.ts" "$tempDir/artifacts/digital-ecom-land/" -Force
Copy-Item "artifacts/digital-ecom-land/tsconfig.json" "$tempDir/artifacts/digital-ecom-land/" -Force
Copy-Item "artifacts/digital-ecom-land/components.json" "$tempDir/artifacts/digital-ecom-land/" -Force
Copy-Item "artifacts/digital-ecom-land/index.html" "$tempDir/artifacts/digital-ecom-land/" -Force
Copy-Item -Recurse "artifacts/digital-ecom-land/src" "$tempDir/artifacts/digital-ecom-land/" -Force
Copy-Item -Recurse "artifacts/digital-ecom-land/public" "$tempDir/artifacts/digital-ecom-land/" -Force

# Root files
Copy-Item "package.json" "$tempDir/" -Force
Copy-Item "pnpm-workspace.yaml" "$tempDir/" -Force
Copy-Item "pnpm-lock.yaml" "$tempDir/" -Force -ErrorAction SilentlyContinue
Copy-Item ".env.production" "$tempDir/" -Force
Copy-Item "ecosystem.config.cjs" "$tempDir/" -Force
Copy-Item "nginx.conf" "$tempDir/" -Force
Copy-Item "deploy.sh" "$tempDir/" -Force
Copy-Item "DEPLOY.md" "$tempDir/" -Force
Copy-Item "QUICK-DEPLOY-GUIDE.md" "$tempDir/" -Force

# Créer l'archive
Write-Host "[INFO] Compression..." -ForegroundColor Blue
$archivePath = Join-Path $env:TEMP "digitalecomland.zip"
if (Test-Path $archivePath) {
    Remove-Item $archivePath -Force
}

Compress-Archive -Path "$tempDir/*" -DestinationPath $archivePath -CompressionLevel Optimal

$archiveSize = (Get-Item $archivePath).Length / 1MB
Write-Host "[OK] Archive creee: $archivePath (" -NoNewline -ForegroundColor Green
Write-Host "$([math]::Round($archiveSize, 2)) MB)" -ForegroundColor Green
Write-Host ""

Write-Host "[INFO] Upload de l'archive vers le serveur..." -ForegroundColor Blue
Write-Host "[WARN] Vous allez devoir entrer le mot de passe SSH" -ForegroundColor Yellow
Write-Host ""

# Upload l'archive
scp -P $PORT $archivePath "${SERVER}:~/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Archive uploadee!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[INFO] Commandes a executer sur le serveur:" -ForegroundColor Blue
    Write-Host ""
    Write-Host "1. Connectez-vous:" -ForegroundColor White
    Write-Host "   ssh -p $PORT $SERVER" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Décompressez l'archive:" -ForegroundColor White
    Write-Host "   unzip -o ~/digitalecomland.zip -d ~/digitalecomland" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Configurez et déployez:" -ForegroundColor White
    Write-Host "   cd ~/digitalecomland" -ForegroundColor Gray
    Write-Host "   cp .env.production .env" -ForegroundColor Gray
    Write-Host "   nano .env  # Configurez votre DATABASE_URL" -ForegroundColor Gray
    Write-Host "   chmod +x deploy.sh" -ForegroundColor Gray
    Write-Host "   bash deploy.sh" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "[ERROR] Erreur lors de l'upload" -ForegroundColor Red
    Write-Host "Essayez manuellement avec un client SFTP (FileZilla)" -ForegroundColor Yellow
}

Write-Host "[INFO] Nettoyage..." -ForegroundColor Blue
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[OK] Termine!" -ForegroundColor Green
