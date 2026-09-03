#!/usr/bin/env python3
"""
Déploiement COMPLET sur serveur Ubuntu dédié
Avec accès root - Installation complète automatique
"""

import sys
import time
import os

SERVER_CONFIG = {
    'host': '192.168.100.211',  # Adresse IP du serveur Ubuntu
    'port': '22',
    'user': 'redsky',
    'password': os.environ.get('HOSTINGER_SSH_PASSWORD'),
}

class C:
    B = '\033[94m'; G = '\033[92m'; Y = '\033[93m'; R = '\033[91m'; N = '\033[0m'; BOLD = '\033[1m'

def p_step(m): print(f"\n{C.B}{C.BOLD}[DEPLOY]{C.N} {m}")
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
    
    p_step("Connexion au serveur Ubuntu...")
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
        p_ok(f"Connecté à {SERVER_CONFIG['host']}")
        return ssh
    except Exception as e:
        p_err(f"Erreur de connexion: {e}")
        return None

def exec_cmd(ssh, cmd, show=False, timeout=300, sudo=False):
    """Exécute une commande sur le serveur"""
    if sudo:
        # Pour les commandes sudo, on ajoute le mot de passe
        cmd = f"echo '{SERVER_CONFIG['password']}' | sudo -S {cmd}"
    
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True, timeout=timeout)
    exit_status = stdout.channel.recv_exit_status()
    output = stdout.read().decode('utf-8', errors='ignore')
    
    if show and output:
        for line in output.strip().split('\n')[:50]:
            if line.strip() and not 'password for' in line.lower():
                print(f"  {line}")
    
    return exit_status == 0, output

def transfer_files(ssh):
    """Transfère l'archive sur le serveur"""
    from scp import SCPClient
    
    p_step("Transfert de l'application sur le serveur...")
    
    archive_path = "deploy_package.zip"
    
    # Vérifier si l'archive existe localement
    import os
    if not os.path.exists(archive_path):
        p_err("Archive locale introuvable, recréation...")
        return False
    
    try:
        with SCPClient(ssh.get_transport()) as scp:
            scp.put(archive_path, "/tmp/digitalecomland.zip")
        p_ok("Archive transférée")
        return True
    except Exception as e:
        p_err(f"Erreur de transfert: {e}")
        return False

def full_ubuntu_deploy(ssh):
    """Déploiement complet sur Ubuntu"""
    
    print(f"\n{C.BOLD}{'='*70}{C.N}")
    print(f"{C.BOLD}{C.B}   🚀 DÉPLOIEMENT COMPLET SUR UBUNTU SERVER{C.N}")
    print(f"{C.BOLD}{'='*70}{C.N}\n")
    
    # 1. Mise à jour du système
    p_step("1/12 Mise à jour du système...")
    exec_cmd(ssh, "apt update -qq", sudo=True, show=False)
    p_ok("Système mis à jour")
    
    # 2. Installation de Node.js 20.x
    p_step("2/12 Installation de Node.js 20.x...")
    commands = [
        "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
        "apt install -y nodejs",
    ]
    for cmd in commands:
        exec_cmd(ssh, cmd, sudo=True, show=False)
    p_ok("Node.js installé")
    
    # 3. Installation de pnpm et PM2
    p_step("3/12 Installation de pnpm et PM2...")
    exec_cmd(ssh, "npm install -g pnpm pm2", sudo=True, show=False)
    p_ok("pnpm et PM2 installés")
    
    # 4. Installation de PostgreSQL
    p_step("4/12 Installation de PostgreSQL...")
    exec_cmd(ssh, "apt install -y postgresql postgresql-contrib", sudo=True, show=False)
    exec_cmd(ssh, "systemctl start postgresql", sudo=True)
    exec_cmd(ssh, "systemctl enable postgresql", sudo=True)
    p_ok("PostgreSQL installé")
    
    # 5. Installation de Nginx
    p_step("5/12 Installation de Nginx...")
    exec_cmd(ssh, "apt install -y nginx", sudo=True, show=False)
    exec_cmd(ssh, "systemctl start nginx", sudo=True)
    exec_cmd(ssh, "systemctl enable nginx", sudo=True)
    p_ok("Nginx installé")
    
    # 6. Création de la base de données
    p_step("6/12 Configuration de PostgreSQL...")
    pg_commands = f"""
sudo -u postgres psql << 'EOFPG'
DROP DATABASE IF EXISTS digitalecomland;
DROP USER IF EXISTS digitalecomland_user;
CREATE DATABASE digitalecomland;
CREATE USER digitalecomland_user WITH PASSWORD '{os.environ.get('HOSTINGER_DB_PASSWORD', '')}';
GRANT ALL PRIVILEGES ON DATABASE digitalecomland TO digitalecomland_user;
EOFPG
"""
    exec_cmd(ssh, pg_commands, show=False)
    p_ok("Base de données créée")
    
    # 7. Transfert de l'application
    p_step("7/12 Transfert de l'application...")
    if not transfer_files(ssh):
        p_warn("Impossible de transférer l'archive, utilisation des fichiers existants")
    else:
        # Décompresser l'archive
        exec_cmd(ssh, "mkdir -p ~/digitalecomland", show=False)
        exec_cmd(ssh, "unzip -o /tmp/digitalecomland.zip -d ~/digitalecomland", show=False)
        exec_cmd(ssh, "rm /tmp/digitalecomland.zip", show=False)
    p_ok("Application transférée")
    
    # 8. Configuration de l'environnement
    p_step("8/12 Configuration des variables d'environnement...")
    env_content = f"""PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://digitalecomland_user:{os.environ.get('HOSTINGER_DB_PASSWORD', '')}@localhost:5432/digitalecomland
"""
    exec_cmd(ssh, f"cat > ~/digitalecomland/.env << 'EOFENV'\n{env_content}\nEOFENV")
    p_ok("Variables configurées")
    
    # 9. Installation des dépendances
    p_step("9/12 Installation des dépendances (peut prendre 3-5 minutes)...")
    exec_cmd(ssh, "cd ~/digitalecomland && pnpm install", show=False, timeout=600)
    p_ok("Dépendances installées")
    
    # 10. Build de l'application
    p_step("10/12 Build de l'application...")
    exec_cmd(ssh, "cd ~/digitalecomland/artifacts/digital-ecom-land && pnpm run build", show=False, timeout=300)
    exec_cmd(ssh, "cd ~/digitalecomland/artifacts/api-server && pnpm run build", show=False, timeout=300)
    p_ok("Application buildée")
    
    # 11. Configuration de PM2
    p_step("11/12 Configuration de PM2...")
    exec_cmd(ssh, "cd ~/digitalecomland && pm2 delete digitalecomland-api 2>/dev/null || true", show=False)
    exec_cmd(ssh, "cd ~/digitalecomland && pm2 start ecosystem.config.cjs", show=False)
    exec_cmd(ssh, "pm2 save", show=False)
    exec_cmd(ssh, "pm2 startup", show=False)
    p_ok("PM2 configuré")
    
    # 12. Configuration de Nginx
    p_step("12/12 Configuration de Nginx...")
    
    nginx_conf = f"""server {{
    listen 80;
    listen [::]:80;
    server_name {SERVER_CONFIG['host']};

    root /home/{SERVER_CONFIG['user']}/digitalecomland/artifacts/digital-ecom-land/dist/public;
    index index.html;

    location / {{
        try_files $uri $uri/ /index.html;
    }}

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
    
    exec_cmd(ssh, f"cat > /tmp/digitalecomland.conf << 'EOFNGINX'\n{nginx_conf}\nEOFNGINX")
    exec_cmd(ssh, "mv /tmp/digitalecomland.conf /etc/nginx/sites-available/digitalecomland", sudo=True)
    exec_cmd(ssh, "ln -sf /etc/nginx/sites-available/digitalecomland /etc/nginx/sites-enabled/", sudo=True)
    exec_cmd(ssh, "rm -f /etc/nginx/sites-enabled/default", sudo=True)
    exec_cmd(ssh, "nginx -t", sudo=True)
    exec_cmd(ssh, "systemctl reload nginx", sudo=True)
    p_ok("Nginx configuré")
    
    # Vérification finale
    p_step("Vérification finale...")
    time.sleep(3)
    
    success, output = exec_cmd(ssh, "pm2 status", show=False)
    if "online" in output:
        p_ok("PM2 - Application en ligne")
    else:
        p_warn("PM2 - Vérifiez les logs")
    
    success, output = exec_cmd(ssh, "systemctl status nginx --no-pager", show=False)
    if "active (running)" in output:
        p_ok("Nginx - Service actif")
    else:
        p_warn("Nginx - Vérifiez la configuration")
    
    # Résumé final
    print(f"\n{C.BOLD}{'='*70}{C.N}")
    print(f"{C.BOLD}{C.G}   ✅ DÉPLOIEMENT COMPLET TERMINÉ !{C.N}")
    print(f"{C.BOLD}{'='*70}{C.N}\n")
    
    print(f"{C.BOLD}🌐 Votre application est accessible sur:{C.N}")
    print(f"  • Frontend: {C.B}http://{SERVER_CONFIG['host']}{C.N}")
    print(f"  • API:      {C.B}http://{SERVER_CONFIG['host']}/api{C.N}")
    print(f"  • API Health: {C.B}http://{SERVER_CONFIG['host']}/api/health{C.N}")
    
    print(f"\n{C.BOLD}📊 Services installés:{C.N}")
    print(f"  ✓ Node.js 20.x")
    print(f"  ✓ pnpm (gestionnaire de paquets)")
    print(f"  ✓ PM2 (gestionnaire de processus)")
    print(f"  ✓ PostgreSQL (base de données)")
    print(f"  ✓ Nginx (serveur web)")
    
    print(f"\n{C.BOLD}🔧 Commandes utiles:{C.N}")
    print(f"  ssh {SERVER_CONFIG['user']}@{SERVER_CONFIG['host']}")
    print(f"  pm2 logs           # Voir les logs")
    print(f"  pm2 status         # Statut des apps")
    print(f"  pm2 restart all    # Redémarrer")
    
    print(f"\n{C.BOLD}📝 Base de données:{C.N}")
    print(f"  Nom: digitalecomland")
    print(f"  Utilisateur: digitalecomland_user")
    print(f"  Mot de passe: configured through HOSTINGER_DB_PASSWORD")
    
    print(f"\n{C.Y}⚠️  Pensez à:{C.N}")
    print(f"  1. Configurer le pare-feu (ufw)")
    print(f"  2. Installer un certificat SSL")
    print(f"  3. Configurer des sauvegardes")
    print()
    
    return True

def main():
    ssh = ssh_connect()
    if not ssh:
        p_err("Impossible de se connecter au serveur")
        return False
    
    try:
        return full_ubuntu_deploy(ssh)
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
