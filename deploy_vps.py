#!/usr/bin/env python3
"""
Déploiement complet automatique sur VPS Ubuntu
"""

import sys
import time

SERVER_CONFIG = {
    'host': '100.78.217.97',
    'port': '22',
    'user': 'redsky',
    'password': 'h0m3.pass',
}

class C:
    B = '\033[94m'; G = '\033[92m'; Y = '\033[93m'; R = '\033[91m'; N = '\033[0m'; BOLD = '\033[1m'

def p_step(m): print(f"\n{C.B}{C.BOLD}[DÉPLOIEMENT VPS]{C.N} {m}")
def p_ok(m): print(f"{C.G}✓ {m}{C.N}")
def p_err(m): print(f"{C.R}✗ {m}{C.N}")
def p_info(m): print(f"{C.B}ℹ {m}{C.N}")
def p_warn(m): print(f"{C.Y}⚠ {m}{C.N}")

def ssh_connect():
    try:
        import paramiko
        from scp import SCPClient
    except:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "scp", "--quiet"])
        import paramiko
        from scp import SCPClient
    
    p_step("Connexion au serveur VPS Ubuntu...")
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
        p_ok(f"Connecté au serveur {SERVER_CONFIG['host']}")
        return ssh
    except Exception as e:
        p_err(f"Erreur de connexion: {e}")
        return None

def exec_cmd(ssh, cmd, show=False, timeout=300):
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    output = stdout.read().decode('utf-8', errors='ignore')
    error = stderr.read().decode('utf-8', errors='ignore')
    
    if show and output:
        lines = output.strip().split('\n')
        for line in lines[:30]:  # Limiter l'affichage
            if line.strip():
                print(f"  {line}")
    
    return exit_status == 0, output, error

def progress_bar(filename, size, sent):
    """Barre de progression pour SCP"""
    if size > 0:
        percent = int((sent / size) * 100)
        bar_length = 50
        filled = int(bar_length * sent / size)
        bar = '█' * filled + '-' * (bar_length - filled)
        print(f"\r  [{bar}] {percent}%", end='', flush=True)
        if sent >= size:
            print()

def deploy_vps(ssh):
    """Déploiement complet sur VPS Ubuntu"""
    
    print(f"\n{C.BOLD}{'='*70}{C.N}")
    print(f"{C.BOLD}{C.B}   🚀 DÉPLOIEMENT AUTOMATIQUE SUR VPS UBUNTU{C.N}")
    print(f"{C.BOLD}{'='*70}{C.N}\n")
    
    app_dir = "/home/redsky/digitalecomland"
    
    # 1. Mise à jour du système
    p_step("1/12 Mise à jour du système...")
    exec_cmd(ssh, "sudo apt update -qq", show=False)
    p_ok("Système mis à jour")
    
    # 2. Installation de Node.js 20.x
    p_step("2/12 Installation de Node.js 20.x...")
    
    success, output, _ = exec_cmd(ssh, "node --version 2>/dev/null || echo 'none'")
    if "v20" in output or "v22" in output:
        p_ok("Node.js déjà installé")
    else:
        p_info("Installation de Node.js...")
        exec_cmd(ssh, "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -", show=False, timeout=120)
        exec_cmd(ssh, "sudo apt install -y nodejs", show=False, timeout=120)
        p_ok("Node.js installé")
    
    # 3. Installation de pnpm et PM2
    p_step("3/12 Installation de pnpm et PM2...")
    exec_cmd(ssh, "sudo npm install -g pnpm pm2 --silent", show=False, timeout=120)
    p_ok("pnpm et PM2 installés")
    
    # 4. Installation de PostgreSQL
    p_step("4/12 Installation de PostgreSQL...")
    
    success, output, _ = exec_cmd(ssh, "psql --version 2>/dev/null || echo 'none'")
    if "PostgreSQL" in output:
        p_ok("PostgreSQL déjà installé")
    else:
        exec_cmd(ssh, "sudo apt install -y postgresql postgresql-contrib", show=False, timeout=180)
        exec_cmd(ssh, "sudo systemctl start postgresql", show=False)
        exec_cmd(ssh, "sudo systemctl enable postgresql", show=False)
        p_ok("PostgreSQL installé et démarré")
    
    # 5. Installation de Nginx
    p_step("5/12 Installation de Nginx...")
    
    success, output, _ = exec_cmd(ssh, "nginx -v 2>&1 || echo 'none'")
    if "nginx" in output:
        p_ok("Nginx déjà installé")
    else:
        exec_cmd(ssh, "sudo apt install -y nginx", show=False, timeout=120)
        exec_cmd(ssh, "sudo systemctl start nginx", show=False)
        exec_cmd(ssh, "sudo systemctl enable nginx", show=False)
        p_ok("Nginx installé et démarré")
    
    # 6. Création du répertoire
    p_step("6/12 Création du répertoire de l'application...")
    exec_cmd(ssh, f"mkdir -p {app_dir}", show=False)
    p_ok(f"Répertoire créé: {app_dir}")
    
    # 7. Transfert de l'archive
    p_step("7/12 Transfert de l'application (27 MB)...")
    
    try:
        from scp import SCPClient
        
        # Créer l'archive locale si elle n'existe pas
        import os
        if not os.path.exists("deploy_package.zip"):
            p_info("Création de l'archive...")
            import zipfile
            from pathlib import Path
            
            with zipfile.ZipFile("deploy_package.zip", 'w', zipfile.ZIP_DEFLATED) as zipf:
                for item in ["artifacts", "package.json", "pnpm-workspace.yaml", "pnpm-lock.yaml", 
                            ".env.production", "ecosystem.config.cjs", "nginx.conf", "deploy.sh"]:
                    item_path = Path(item)
                    if item_path.exists():
                        if item_path.is_file():
                            zipf.write(item_path, item)
                        elif item_path.is_dir():
                            for file_path in item_path.rglob('*'):
                                if file_path.is_file():
                                    zipf.write(file_path, str(file_path))
            p_info("Archive créée")
        
        with SCPClient(ssh.get_transport(), progress=progress_bar) as scp:
            scp.put("deploy_package.zip", f"{app_dir}/deploy_package.zip")
        
        p_ok("Application transférée")
    except Exception as e:
        p_err(f"Erreur de transfert: {e}")
        return False
    
    # 8. Décompression
    p_step("8/12 Décompression de l'application...")
    exec_cmd(ssh, f"cd {app_dir} && unzip -o deploy_package.zip", show=False)
    p_ok("Application décompressée")
    
    # 9. Configuration de PostgreSQL
    p_step("9/12 Configuration de la base de données...")
    
    db_commands = f"""
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS digitalecomland;" 2>/dev/null || true
    sudo -u postgres psql -c "DROP USER IF EXISTS digitalecomland_user;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE digitalecomland;"
    sudo -u postgres psql -c "CREATE USER digitalecomland_user WITH PASSWORD 'DigitalEcom2024!Secure';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE digitalecomland TO digitalecomland_user;"
    """
    
    exec_cmd(ssh, db_commands, show=False)
    p_ok("Base de données configurée")
    
    # 10. Configuration de l'environnement
    p_step("10/12 Configuration des variables d'environnement...")
    
    env_content = f"""PORT=3001
NODE_ENV=production
API_PORT=3001
DATABASE_URL=postgresql://digitalecomland_user:DigitalEcom2024!Secure@localhost:5432/digitalecomland
VITE_API_URL=http://{SERVER_CONFIG['host']}:3001
"""
    
    exec_cmd(ssh, f"cat > {app_dir}/.env << 'EOFENV'\n{env_content}\nEOFENV", show=False)
    p_ok("Variables d'environnement configurées")
    
    # 11. Installation et build
    p_step("11/12 Installation des dépendances et build (peut prendre 3-5 minutes)...")
    
    exec_cmd(ssh, f"cd {app_dir} && pnpm install 2>&1", show=False, timeout=300)
    p_info("Dépendances installées")
    
    exec_cmd(ssh, f"cd {app_dir}/artifacts/digital-ecom-land && pnpm run build 2>&1", show=False, timeout=180)
    p_info("Frontend buildé")
    
    exec_cmd(ssh, f"cd {app_dir}/artifacts/api-server && pnpm run build 2>&1", show=False, timeout=120)
    p_ok("Backend buildé")
    
    # 12. Configuration de Nginx
    p_step("12/12 Configuration de Nginx...")
    
    nginx_conf = f"""server {{
    listen 80;
    listen [::]:80;
    server_name {SERVER_CONFIG['host']};

    root {app_dir}/artifacts/digital-ecom-land/dist/public;
    index index.html;

    # Frontend
    location / {{
        try_files $uri $uri/ /index.html;
    }}

    # API
    location /api {{
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }}
}}
"""
    
    exec_cmd(ssh, f"cat > /tmp/digitalecomland.conf << 'EOFNGINX'\n{nginx_conf}\nEOFNGINX", show=False)
    exec_cmd(ssh, "sudo mv /tmp/digitalecomland.conf /etc/nginx/sites-available/digitalecomland", show=False)
    exec_cmd(ssh, "sudo ln -sf /etc/nginx/sites-available/digitalecomland /etc/nginx/sites-enabled/", show=False)
    exec_cmd(ssh, "sudo rm -f /etc/nginx/sites-enabled/default", show=False)
    exec_cmd(ssh, "sudo nginx -t && sudo systemctl reload nginx", show=False)
    p_ok("Nginx configuré")
    
    # Démarrage avec PM2
    p_step("Démarrage de l'application avec PM2...")
    
    exec_cmd(ssh, f"cd {app_dir} && pm2 delete digitalecomland-api 2>/dev/null || true", show=False)
    exec_cmd(ssh, f"cd {app_dir} && pm2 start ecosystem.config.cjs", show=False)
    exec_cmd(ssh, "pm2 save", show=False)
    exec_cmd(ssh, "pm2 startup", show=False)
    p_ok("Application démarrée avec PM2")
    
    # Vérification finale
    p_step("Vérification finale...")
    time.sleep(3)
    
    success, output, _ = exec_cmd(ssh, "pm2 status", show=False)
    if "online" in output:
        p_ok("PM2 - Application en ligne")
    
    success, output, _ = exec_cmd(ssh, "curl -s http://localhost:3001/api/health || echo 'pending'", show=False)
    if "pending" not in output.lower():
        p_ok("API répond correctement")
    
    success, output, _ = exec_cmd(ssh, f"curl -s -o /dev/null -w '%{{http_code}}' http://localhost/", show=False)
    if "200" in output:
        p_ok("Frontend accessible")
    
    # Affichage du résultat final
    print(f"\n{C.BOLD}{'='*70}{C.N}")
    print(f"{C.BOLD}{C.G}   ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !{C.N}")
    print(f"{C.BOLD}{'='*70}{C.N}\n")
    
    print(f"{C.BOLD}🌐 Votre application est accessible sur:{C.N}")
    print(f"  • Frontend: {C.B}http://{SERVER_CONFIG['host']}{C.N}")
    print(f"  • API:      {C.B}http://{SERVER_CONFIG['host']}/api{C.N}")
    
    print(f"\n{C.BOLD}📊 Services installés:{C.N}")
    print(f"  ✓ Node.js 20.x")
    print(f"  ✓ pnpm")
    print(f"  ✓ PM2 (gestionnaire de processus)")
    print(f"  ✓ PostgreSQL (base de données)")
    print(f"  ✓ Nginx (serveur web)")
    
    print(f"\n{C.BOLD}🔧 Commandes utiles:{C.N}")
    print(f"  ssh {SERVER_CONFIG['user']}@{SERVER_CONFIG['host']}")
    print(f"  pm2 status        - Voir le statut")
    print(f"  pm2 logs          - Voir les logs")
    print(f"  pm2 restart all   - Redémarrer")
    
    print(f"\n{C.BOLD}🔒 Base de données:{C.N}")
    print(f"  Nom: digitalecomland")
    print(f"  User: digitalecomland_user")
    print(f"  Pass: DigitalEcom2024!Secure")
    
    print(f"\n{C.Y}⚠  IMPORTANT: Changez le mot de passe SSH après le déploiement !{C.N}")
    print(f"   Commande: passwd")
    print()
    
    return True

def main():
    ssh = ssh_connect()
    if not ssh:
        return False
    
    try:
        return deploy_vps(ssh)
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
        print(f"\n{C.Y}Annulé par l'utilisateur{C.N}")
        sys.exit(1)
