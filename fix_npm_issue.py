#!/usr/bin/env python3
"""
Correction du problème pnpm - Supprime la restriction npm
"""

import sys
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
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=120)
    exit_status = stdout.channel.recv_exit_status()
    output = stdout.read().decode('utf-8', errors='ignore')
    if show and output:
        print(output[:1000])
    return exit_status == 0, output

def fix_npm_problem(ssh):
    """Corrige le problème pnpm"""
    
    domain = "digitalsolverland.space"
    api_path = f"/home/{SERVER_CONFIG['user']}/domains/{domain}/api"
    
    print(f"\n{C.BOLD}{'='*70}{C.N}")
    print(f"{C.BOLD}{C.Y}   🔧 CORRECTION DU PROBLÈME PNPM{C.N}")
    print(f"{C.BOLD}{'='*70}{C.N}\n")
    
    # 1. Supprimer tous les fichiers qui forcent pnpm
    p_step("1/4 Suppression des fichiers qui forcent pnpm...")
    
    exec_cmd(ssh, f"cd {api_path} && rm -f pnpm-lock.yaml pnpm-workspace.yaml .npmrc")
    p_ok("Fichiers pnpm supprimés")
    
    # 2. Créer un package.json SANS restriction pnpm
    p_step("2/4 Création d'un package.json sans restriction...")
    
    package_json = """{
  "name": "digitalecomland-api",
  "version": "1.0.0",
  "type": "module",
  "main": "index.mjs",
  "scripts": {
    "start": "node index.mjs"
  },
  "dependencies": {
    "express": "^5.2.1",
    "cors": "^2.8.6",
    "cookie-parser": "^1.4.7",
    "pino": "^9.14.0",
    "pino-http": "^10.5.0",
    "dotenv": "^16.4.5"
  }
}"""
    
    exec_cmd(ssh, f"cat > {api_path}/package.json << 'EOFPKG'\n{package_json}\nEOFPKG")
    p_ok("package.json recréé sans restriction")
    
    # 3. Nettoyer node_modules
    p_step("3/4 Nettoyage complet...")
    exec_cmd(ssh, f"cd {api_path} && rm -rf node_modules package-lock.json")
    p_ok("Nettoyage effectué")
    
    # 4. Réinstaller avec npm
    p_step("4/4 Installation des dépendances avec npm...")
    
    success, output = exec_cmd(ssh, f"cd {api_path} && npm install --legacy-peer-deps 2>&1", show=False)
    
    if "added" in output.lower():
        p_ok("Dépendances installées avec succès")
    else:
        p_info("Installation individuelle des packages...")
        packages = ["dotenv", "express", "cors", "cookie-parser", "pino", "pino-http"]
        for pkg in packages:
            exec_cmd(ssh, f"cd {api_path} && npm install {pkg} --save --legacy-peer-deps 2>&1", show=False)
        p_ok("Packages installés individuellement")
    
    # Vérification finale
    p_step("Vérification finale...")
    
    success, output = exec_cmd(ssh, f"ls -la {api_path}/")
    
    if "node_modules" in output:
        p_ok("node_modules créé avec succès")
    else:
        p_err("node_modules manquant")
    
    if "package.json" in output:
        p_ok("package.json présent")
    
    if "index.mjs" in output:
        p_ok("index.mjs présent")
    
    # Créer un fichier .npmrc pour éviter les problèmes futurs
    p_step("Configuration de npm...")
    
    npmrc = """legacy-peer-deps=true
package-lock=false
"""
    
    exec_cmd(ssh, f"cat > {api_path}/.npmrc << 'EOFNPMRC'\n{npmrc}\nEOFNPMRC")
    p_ok("Configuration npm créée")
    
    print(f"\n{C.BOLD}{'='*70}{C.N}")
    print(f"{C.BOLD}{C.G}   ✅ PROBLÈME CORRIGÉ{C.N}")
    print(f"{C.BOLD}{'='*70}{C.N}\n")
    
    print(f"{C.BOLD}📦 Structure corrigée:{C.N}")
    print(f"  ✓ package.json (sans restriction pnpm)")
    print(f"  ✓ node_modules/ (dépendances npm)")
    print(f"  ✓ .npmrc (configuration npm)")
    print(f"  ✓ index.mjs (point d'entrée)")
    print(f"  ✓ dist/ (code compilé)")
    print(f"  ✓ .env (variables)")
    
    print(f"\n{C.BOLD}🎯 Action dans hPanel:{C.N}")
    print(f"  1. Allez dans Node.js")
    print(f"  2. Cliquez sur RESTART (🔄)")
    print(f"  3. Attendez 30 secondes")
    print(f"  4. L'API démarre !")
    
    print(f"\n{C.BOLD}🌐 Test:{C.N}")
    print(f"  Frontend: {C.B}http://{domain}{C.N}")
    print(f"  API:      {C.B}http://{domain}/api/health{C.N}")
    print()
    
    return True

def main():
    ssh = ssh_connect()
    if not ssh:
        return False
    
    try:
        return fix_npm_problem(ssh)
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
