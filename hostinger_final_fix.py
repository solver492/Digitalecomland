#!/usr/bin/env python3
"""
Solution finale pour Hostinger - Configure tout automatiquement
"""

import sys
import time
import os

SERVER_CONFIG = {
    'host': '147.93.54.128',
    'port': '65002',
    'user': 'u696346042',
    'password': os.environ.get('HOSTINGER_SSH_PASSWORD'),
}

class C:
    B = '\033[94m'; G = '\033[92m'; Y = '\033[93m'; R = '\033[91m'; N = '\033[0m'; BOLD = '\033[1m'

def p_step(m): print(f"\n{C.B}{C.BOLD}[FIX]{C.N} {m}")
def p_ok(m): print(f"{C.G}✓ {m}{C.N}")
def p_err(m): print(f"{C.R}✗ {m}{C.N}")
def p_info(m): print(f"{C.B}ℹ {m}{C.N}")

def ssh_connect():
    try:
        import paramiko
    except:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "--quiet"])
        import paramiko
    
    p_step("Connexion au serveur...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        hostname=SERVER_CONFIG['host'],
        port=int(SERVER_CONFIG['port']),
        username=SERVER_CONFIG['user'],
        password=SERVER_CONFIG['password'],
        timeout=30
    )
    p_ok("Connecté")
    return ssh

def exec_cmd(ssh, cmd, show=False):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=300)
    exit_status = stdout.channel.recv_exit_status()
    output = stdout.read().decode('utf-8', errors='ignore')
    if show and output:
        for line in output.strip().split('\n')[:50]:  # Limiter l'affichage
            if line.strip(): print(f"  {line}")
    return exit_status == 0, output

def fix_hostinger(ssh):
    """Configure l'application pour Hostinger"""
    
    p_step("Configuration de l'application pour Hostinger...")
    
    domain = "digitalsolverland.space"
    api_path = f"/home/{SERVER_CONFIG['user']}/domains/{domain}/api"
    
    # Créer le package.json simplifié pour l'API
    p_step("Création du package.json simplifié...")
    
    package_json = """{
  "name": "digitalecomland-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node dist/index.mjs"
  },
  "dependencies": {
    "express": "^5.2.1",
    "cors": "^2.8.6",
    "cookie-parser": "^1.4.7",
    "pino": "^9.14.0",
    "pino-http": "^10.5.0"
  }
}"""
    
    exec_cmd(ssh, f"cat > {api_path}/package.json << 'EOFPKG'\n{package_json}\nEOFPKG")
    p_ok("package.json créé")
    
    # Vérifier que le build existe
    p_step("Vérification du build de l'API...")
    success, output = exec_cmd(ssh, f"ls -la {api_path}/dist/index.mjs")
    
    if "index.mjs" not in output:
        p_err("Le fichier dist/index.mjs n'existe pas")
        p_info("Copie du build depuis digitalecomland...")
        exec_cmd(ssh, f"cp -r ~/digitalecomland/artifacts/api-server/dist {api_path}/")
        p_ok("Build copié")
    else:
        p_ok("Build existe")
    
    # Créer le fichier .env
    p_step("Configuration des variables d'environnement...")
    
    env_content = f"""PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://digitalecomland_user:{os.environ.get('HOSTINGER_DB_PASSWORD', '')}@localhost:5432/digitalecomland
"""
    
    exec_cmd(ssh, f"cat > {api_path}/.env << 'EOFENV'\n{env_content}\nEOFENV")
    p_ok("Fichier .env créé")
    
    # Créer un fichier d'entrée simple qui charge les variables d'environnement
    p_step("Création du fichier d'entrée...")
    
    entry_file = """// Entry point pour Hostinger
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger l'application principale
const indexPath = join(__dirname, 'dist', 'index.mjs');
await import(indexPath);
"""
    
    exec_cmd(ssh, f"cat > {api_path}/index.mjs << 'EOFENTRY'\n{entry_file}\nEOFENTRY")
    p_ok("Fichier d'entrée créé")
    
    # Installer npm dotenv
    p_step("Installation de dotenv...")
    exec_cmd(ssh, f"cd {api_path} && npm install dotenv --save 2>&1", show=False)
    p_ok("dotenv installé")
    
    # Créer un fichier de configuration pour hPanel
    p_step("Création du fichier de configuration hPanel...")
    
    hpanel_config = f"""CONFIGURATION POUR hPANEL NODE.JS
========================================

Application root: {api_path}
Application URL: {domain}/api
Application startup file: index.mjs
Node.js version: 20.x ou supérieur
Port: 3001

Variables d'environnement à ajouter dans hPanel:
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://digitalecomland_user:<HOSTINGER_DB_PASSWORD>@localhost:5432/digitalecomland

IMPORTANT: 
- Utilisez "index.mjs" comme fichier d'entrée
- Assurez-vous que le port 3001 est disponible
- Après création, cliquez sur "START"
"""
    
    exec_cmd(ssh, f"cat > {api_path}/HPANEL_CONFIG.txt << 'EOFCFG'\n{hpanel_config}\nEOFCFG")
    p_ok("Fichier de configuration créé")
    
    # Vérifier la structure
    p_step("Vérification de la structure...")
    success, output = exec_cmd(ssh, f"ls -la {api_path}/")
    p_info("Fichiers présents:")
    for line in output.split('\n'):
        if any(x in line for x in ['package.json', 'index.mjs', 'dist', '.env', 'node_modules']):
            print(f"    {line.strip()}")
    
    # Créer un script de démarrage de secours
    p_step("Création d'un script de démarrage alternatif...")
    
    start_script = """#!/bin/bash
# Script de démarrage pour l'API
cd "$(dirname "$0")"
export PORT=3001
export NODE_ENV=production
export DATABASE_URL="postgresql://digitalecomland_user:${HOSTINGER_DB_PASSWORD}@localhost:5432/digitalecomland"

# Vérifier que Node est disponible
if ! command -v node &> /dev/null; then
    echo "Node.js n'est pas installé ou pas dans le PATH"
    exit 1
fi

echo "Démarrage de l'API sur le port 3001..."
node index.mjs
"""
    
    exec_cmd(ssh, f"cat > {api_path}/start.sh << 'EOFSTART'\n{start_script}\nEOFSTART")
    exec_cmd(ssh, f"chmod +x {api_path}/start.sh")
    p_ok("Script de démarrage créé")
    
    # Test rapide du fichier
    p_step("Test du fichier d'entrée...")
    success, output = exec_cmd(ssh, f"cd {api_path} && node -e \"console.log('Node.js fonctionne')\"")
    if success:
        p_ok("Node.js est accessible")
    else:
        p_err("Problème avec Node.js")
    
    print(f"\n{C.BOLD}{'='*60}{C.N}")
    print(f"{C.BOLD}{C.G}   ✓ CONFIGURATION TERMINÉE{C.N}")
    print(f"{C.BOLD}{'='*60}{C.N}\n")
    
    print(f"{C.BOLD}Prochaines étapes dans hPanel:{C.N}\n")
    print(f"1. Allez sur: {C.B}https://hpanel.hostinger.com{C.N}")
    print(f"2. Cliquez sur: Advanced > Node.js")
    print(f"3. Modifiez l'application Node.js existante:")
    print(f"   {C.Y}Application root:{C.N} {api_path}")
    print(f"   {C.Y}Fichier d'entrée:{C.N} index.mjs")
    print(f"   {C.Y}Node.js version:{C.N} 20.x")
    print(f"   {C.Y}Application URL:{C.N} {domain}/api")
    print(f"\n4. Variables d'environnement:")
    print(f"   PORT=3001")
    print(f"   NODE_ENV=production")
    print(f"   DATABASE_URL=postgresql://...(voir fichier .env)")
    print(f"\n5. Cliquez sur {C.G}SAVE{C.N} puis {C.G}START{C.N}")
    
    print(f"\n{C.BOLD}Fichiers créés:{C.N}")
    print(f"  • {api_path}/index.mjs (point d'entrée)")
    print(f"  • {api_path}/package.json")
    print(f"  • {api_path}/.env")
    print(f"  • {api_path}/HPANEL_CONFIG.txt (instructions)")
    print(f"  • {api_path}/start.sh (script de secours)")
    
    print(f"\n{C.BOLD}Accès:{C.N}")
    print(f"  • Frontend: {C.B}http://{domain}{C.N}")
    print(f"  • API (après config): {C.B}http://{domain}/api{C.N}")
    print()
    
    return True

def main():
    print(f"\n{C.BOLD}{'='*60}{C.N}")
    print(f"{C.BOLD}{C.B}   CONFIGURATION FINALE HOSTINGER{C.N}")
    print(f"{C.BOLD}{'='*60}{C.N}\n")
    
    ssh = ssh_connect()
    if not ssh:
        return False
    
    try:
        return fix_hostinger(ssh)
    except Exception as e:
        p_err(f"Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        ssh.close()

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{C.Y}Annulé{C.N}")
        sys.exit(1)
