#!/usr/bin/env python3
"""
Script de réparation du déploiement
Corrige les erreurs 403/404 de Nginx
"""

import sys
import time
import os

# Configuration du serveur
SERVER_CONFIG = {
    'host': '147.93.54.128',
    'port': '65002',
    'user': 'u696346042',
    'password': os.environ.get('HOSTINGER_SSH_PASSWORD'),
}

APP_CONFIG = {
    'app_dir': '/home/u696346042/digitalecomland',
}

# Couleurs
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_step(msg):
    print(f"\n{Colors.BLUE}{Colors.BOLD}[RÉPARATION]{Colors.RESET} {msg}")

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.RESET}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.RESET}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.RESET}")

def ssh_connect():
    """Connexion SSH"""
    import paramiko
    
    print_step("Connexion au serveur...")
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(
            hostname=SERVER_CONFIG['host'],
            port=int(SERVER_CONFIG['port']),
            username=SERVER_CONFIG['user'],
            password=SERVER_CONFIG['password'],
            timeout=30
        )
        print_success(f"Connecté à {SERVER_CONFIG['host']}")
        return ssh
    except Exception as e:
        print_error(f"Erreur de connexion: {e}")
        return None

def exec_cmd(ssh, cmd, show=False):
    """Exécute une commande"""
    # Remplacer sudo par commande directe si pas disponible
    cmd = cmd.replace('sudo ', '')
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    exit_status = stdout.channel.recv_exit_status()
    output = stdout.read().decode('utf-8', errors='ignore')
    if show:
        print(output)
    return exit_status == 0, output

def fix_deployment(ssh):
    """Répare le déploiement"""
    
    app_dir = APP_CONFIG['app_dir']
    
    print_step("Diagnostic du problème...")
    
    # Vérifier la structure
    success, output = exec_cmd(ssh, f"ls -la {app_dir}/artifacts/digital-ecom-land/dist/")
    if "public" in output:
        print_info("Structure détectée: dist/public/")
        dist_path = f"{app_dir}/artifacts/digital-ecom-land/dist/public"
    else:
        print_info("Structure détectée: dist/")
        dist_path = f"{app_dir}/artifacts/digital-ecom-land/dist"
    
    print_step("Correction des permissions...")
    
    # Donner les bonnes permissions
    commands = [
        f"chmod 755 /home/{SERVER_CONFIG['user']}",
        f"chmod -R 755 {app_dir}",
        f"chmod -R 755 {app_dir}/artifacts/digital-ecom-land/dist",
    ]
    
    for cmd in commands:
        exec_cmd(ssh, cmd)
    
    print_success("Permissions corrigées")
    
    print_step("Mise à jour de la configuration Nginx...")
    
    # Créer la nouvelle configuration Nginx
    nginx_conf = f"""server {{
    listen 80;
    listen [::]:80;
    server_name {SERVER_CONFIG['host']};

    access_log /var/log/nginx/digitalecomland-access.log;
    error_log /var/log/nginx/digitalecomland-error.log;

    root {dist_path};
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Frontend - SPA routing
    location / {{
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }}

    # Cache pour les assets statiques
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {{
        expires 1y;
        add_header Cache-Control "public, immutable";
    }}

    # API Backend - Proxy vers Node.js
    location /api {{
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }}

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}}
"""
    
    # Écrire la configuration
    exec_cmd(ssh, f"cat > /tmp/nginx_digitalecomland.conf << 'EOFNGINX'\n{nginx_conf}\nEOFNGINX")
    exec_cmd(ssh, "sudo mv /tmp/nginx_digitalecomland.conf /etc/nginx/sites-available/digitalecomland")
    
    print_success("Configuration Nginx mise à jour")
    
    print_step("Vérification de PM2...")
    
    # Vérifier PM2
    success, output = exec_cmd(ssh, "pm2 status")
    if "online" not in output or "digitalecomland-api" not in output:
        print_info("Redémarrage de l'application...")
        exec_cmd(ssh, f"cd {app_dir} && pm2 delete digitalecomland-api 2>/dev/null || true")
        exec_cmd(ssh, f"cd {app_dir} && pm2 start ecosystem.config.cjs")
        exec_cmd(ssh, "pm2 save")
        print_success("Application redémarrée")
    else:
        print_success("Application PM2 en ligne")
    
    print_step("Test et redémarrage de Nginx...")
    
    # Tester et redémarrer Nginx
    success, output = exec_cmd(ssh, "sudo nginx -t")
    if success:
        print_success("Configuration Nginx valide")
        exec_cmd(ssh, "sudo systemctl restart nginx")
        print_success("Nginx redémarré")
    else:
        print_error("Erreur dans la configuration Nginx")
        print(output)
    
    print_step("Vérification finale...")
    time.sleep(3)
    
    # Test de l'API
    success, output = exec_cmd(ssh, "curl -s http://localhost:3001/api/health || echo 'ERREUR'")
    if "ERREUR" not in output:
        print_success("API fonctionne")
    else:
        print_error("L'API ne répond pas")
        print_info("Vérification des logs PM2...")
        exec_cmd(ssh, "pm2 logs digitalecomland-api --lines 20", show=True)
    
    # Test du frontend
    success, output = exec_cmd(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost/")
    if "200" in output:
        print_success("Frontend accessible")
    else:
        print_error(f"Frontend retourne: {output}")
    
    # Afficher les logs Nginx si erreur
    if "200" not in output:
        print_info("Logs Nginx:")
        exec_cmd(ssh, "sudo tail -20 /var/log/nginx/error.log", show=True)

def main():
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.YELLOW}   RÉPARATION DU DÉPLOIEMENT{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
    
    # Installation des dépendances si nécessaire
    try:
        import paramiko
    except ImportError:
        print_info("Installation de paramiko...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "--quiet"])
    
    # Connexion
    ssh = ssh_connect()
    if not ssh:
        return False
    
    try:
        # Réparer
        fix_deployment(ssh)
        
        print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.GREEN}   ✓ RÉPARATION TERMINÉE{Colors.RESET}")
        print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
        
        print(f"{Colors.BOLD}Testez maintenant:{Colors.RESET}")
        print(f"  • Frontend: {Colors.BLUE}http://{SERVER_CONFIG['host']}{Colors.RESET}")
        print(f"  • API:      {Colors.BLUE}http://{SERVER_CONFIG['host']}/api{Colors.RESET}")
        print()
        
        return True
        
    except Exception as e:
        print_error(f"Erreur: {e}")
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
        print(f"\n{Colors.YELLOW}Annulé{Colors.RESET}")
        sys.exit(1)
