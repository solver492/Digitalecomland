#!/usr/bin/env python3
"""
Déploiement adapté pour Hostinger
"""

import sys
import time

SERVER_CONFIG = {
    'host': '147.93.54.128',
    'port': '65002',
    'user': 'u696346042',
    'password': 'Dagdag676@',
}

# Couleurs
class C:
    B = '\033[94m'; G = '\033[92m'; Y = '\033[93m'; R = '\033[91m'; N = '\033[0m'; BOLD = '\033[1m'

def p_step(m): print(f"\n{C.B}{C.BOLD}[ÉTAPE]{C.N} {m}")
def p_ok(m): print(f"{C.G}✓ {m}{C.N}")
def p_err(m): print(f"{C.R}✗ {m}{C.N}")
def p_info(m): print(f"{C.B}ℹ {m}{C.N}")
def p_warn(m): print(f"{C.Y}⚠ {m}{C.N}")

def ssh_connect():
    try:
        import paramiko
    except:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "--quiet"])
        import paramiko
    
    p_step("Connexion au serveur Hostinger...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        hostname=SERVER_CONFIG['host'],
        port=int(SERVER_CONFIG['port']),
        username=SERVER_CONFIG['user'],
        password=SERVER_CONFIG['password'],
        timeout=30
    )
    p_ok(f"Connecté à {SERVER_CONFIG['host']}")
    return ssh

def exec_cmd(ssh, cmd, show=False):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    exit_status = stdout.channel.recv_exit_status()
    output = stdout.read().decode('utf-8', errors='ignore')
    if show and output:
        for line in output.strip().split('\n'):
            if line.strip(): print(f"  {line}")
    return exit_status == 0, output

def deploy_hostinger(ssh):
    """Déploiement pour Hostinger"""
    
    p_step("Détection du domaine principal...")
    
    # Chercher le domaine principal (celui avec le plus de fichiers web)
    success, output = exec_cmd(ssh, "ls -1 ~/domains/")
    domains = [d.strip() for d in output.strip().split('\n') if d.strip() and not d.startswith('.')]
    
    p_info(f"Domaines disponibles: {', '.join(domains)}")
    
    # Choisir le premier domaine qui n'est pas un sous-domaine Hostinger temporaire
    target_domain = None
    for domain in domains:
        if not domain.endswith('.hostingersite.com'):
            target_domain = domain
            break
    
    if not target_domain and domains:
        target_domain = domains[0]  # Utiliser le premier si aucun domaine custom
    
    if not target_domain:
        p_err("Aucun domaine trouvé")
        return False
    
    p_ok(f"Domaine sélectionné: {target_domain}")
    
    domain_path = f"/home/{SERVER_CONFIG['user']}/domains/{target_domain}"
    public_html = f"{domain_path}/public_html"
    
    p_step("Copie des fichiers vers public_html...")
    
    # Créer un backup du public_html actuel
    exec_cmd(ssh, f"mv {public_html} {public_html}.backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true")
    
    # Créer le nouveau public_html
    exec_cmd(ssh, f"mkdir -p {public_html}")
    
    # Copier les fichiers buildés du frontend
    success, output = exec_cmd(ssh, f"ls -la ~/digitalecomland/artifacts/digital-ecom-land/dist/")
    
    if "public" in output:
        p_info("Copie depuis dist/public/...")
        exec_cmd(ssh, f"cp -r ~/digitalecomland/artifacts/digital-ecom-land/dist/public/* {public_html}/")
    else:
        p_info("Copie depuis dist/...")
        exec_cmd(ssh, f"cp -r ~/digitalecomland/artifacts/digital-ecom-land/dist/* {public_html}/")
    
    p_ok("Fichiers frontend copiés")
    
    p_step("Configuration du fichier .htaccess pour le routing SPA...")
    
    htaccess_content = """# SPA Router
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api
  RewriteRule . /index.html [L]
</IfModule>

# Cache pour assets statiques
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType application/x-javascript "access plus 1 year"
  ExpiresByType application/font-woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Compression Gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
"""
    
    exec_cmd(ssh, f"cat > {public_html}/.htaccess << 'EOFHTACCESS'\n{htaccess_content}\nEOFHTACCESS")
    p_ok("Fichier .htaccess créé")
    
    p_step("Permissions des fichiers...")
    exec_cmd(ssh, f"chmod -R 755 {public_html}")
    exec_cmd(ssh, f"find {public_html} -type f -exec chmod 644 {{}} \\;")
    p_ok("Permissions configurées")
    
    p_step("Déploiement du backend API...")
    
    # Sur Hostinger, on doit utiliser Node.js via le panel de contrôle
    # Créer un fichier de configuration pour l'API
    api_dir = f"{domain_path}/api"
    exec_cmd(ssh, f"mkdir -p {api_dir}")
    
    # Copier les fichiers de l'API
    exec_cmd(ssh, f"cp -r ~/digitalecomland/artifacts/api-server/* {api_dir}/")
    exec_cmd(ssh, f"cp ~/digitalecomland/.env {api_dir}/")
    exec_cmd(ssh, f"cp ~/digitalecomland/package.json {api_dir}/")
    exec_cmd(ssh, f"cp ~/digitalecomland/pnpm-lock.yaml {api_dir}/ 2>/dev/null || true")
    
    p_ok("Fichiers API copiés")
    
    p_step("Création du script de démarrage Node.js...")
    
    # Créer un script pour démarrer l'API
    start_script = f"""#!/bin/bash
cd {api_dir}
export PORT=3001
export NODE_ENV=production
export PATH=$HOME/.nvm/versions/node/v20.18.1/bin:$PATH

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
  npm install --production
fi

# Démarrer l'application
node dist/index.mjs
"""
    
    exec_cmd(ssh, f"cat > {api_dir}/start.sh << 'EOFSTART'\n{start_script}\nEOFSTART")
    exec_cmd(ssh, f"chmod +x {api_dir}/start.sh")
    
    p_ok("Script de démarrage créé")
    
    p_step("Informations de déploiement...")
    
    # Vérifier le domaine
    success, ip_output = exec_cmd(ssh, f"hostname -I | awk '{{print $1}}'")
    server_ip = ip_output.strip() if ip_output else SERVER_CONFIG['host']
    
    print(f"\n{C.BOLD}{'='*60}{C.N}")
    print(f"{C.BOLD}{C.G}   ✓ DÉPLOIEMENT TERMINÉ{C.N}")
    print(f"{C.BOLD}{'='*60}{C.N}\n")
    
    p_ok(f"Frontend déployé sur: {target_domain}")
    p_info(f"Chemin: {public_html}")
    
    print(f"\n{C.BOLD}Accès à l'application:{C.N}")
    print(f"  • Par domaine: http://{target_domain}")
    print(f"  • Par IP:      http://{server_ip}")
    
    print(f"\n{C.BOLD}Pour démarrer l'API backend:{C.N}")
    p_warn("Vous devez configurer Node.js via le panel Hostinger:")
    print(f"  1. Connectez-vous à hPanel (https://hpanel.hostinger.com)")
    print(f"  2. Allez dans 'Advanced' > 'Node.js'")
    print(f"  3. Créez une nouvelle application Node.js:")
    print(f"     - Application root: {api_dir}")
    print(f"     - Application URL: {target_domain}/api")
    print(f"     - Application startup file: dist/index.mjs")
    print(f"     - Node.js version: 20.x")
    print(f"  4. Cliquez sur 'CREATE'")
    
    print(f"\n{C.BOLD}Alternative - API sur autre domaine:{C.N}")
    print(f"  Vous pouvez créer un sous-domaine api.{target_domain}")
    print(f"  et y déployer l'API séparément")
    
    print(f"\n{C.Y}NOTE: Le frontend fonctionne maintenant !{C.N}")
    print(f"{C.Y}L'API nécessite une configuration manuelle via hPanel{C.N}\n")
    
    return True

def main():
    print(f"\n{C.BOLD}{'='*60}{C.N}")
    print(f"{C.BOLD}{C.B}   DÉPLOIEMENT HOSTINGER - DIGITAL ECOM LAND{C.N}")
    print(f"{C.BOLD}{'='*60}{C.N}\n")
    
    ssh = ssh_connect()
    if not ssh:
        return False
    
    try:
        return deploy_hostinger(ssh)
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
