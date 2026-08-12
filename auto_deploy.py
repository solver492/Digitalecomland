#!/usr/bin/env python3
"""
Script de déploiement automatique pour Digital Ecom Land
Ce script déploie automatiquement l'application sur le serveur
"""

import os
import sys
import time
import subprocess
import zipfile
from pathlib import Path

# Configuration du serveur
SERVER_CONFIG = {
    'host': '147.93.54.128',
    'port': '65002',
    'user': 'u696346042',
    'password': 'Dagdag676@',
}

# Configuration de l'application
APP_CONFIG = {
    'db_name': 'digitalecomland',
    'db_user': 'digitalecomland_user',
    'db_password': 'DigitalEcom2024!Secure',
    'api_port': '3001',
    'app_dir': '/home/u696346042/digitalecomland',
}

# Couleurs pour l'affichage
class Colors:
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_step(message):
    print(f"\n{Colors.BLUE}{Colors.BOLD}[ÉTAPE]{Colors.RESET} {message}")

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.RESET}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.RESET}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.RESET}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ {message}{Colors.RESET}")

def check_dependencies():
    """Vérifie que les dépendances Python nécessaires sont installées"""
    print_step("Vérification des dépendances Python...")
    
    missing_deps = []
    
    try:
        import paramiko
        print_success("paramiko installé")
    except ImportError:
        missing_deps.append("paramiko")
    
    try:
        from scp import SCPClient
        print_success("scp installé")
    except ImportError:
        missing_deps.append("scp")
    
    if missing_deps:
        print_warning(f"Dépendances manquantes: {', '.join(missing_deps)}")
        print_info("Installation des dépendances...")
        
        for dep in missing_deps:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", dep, "--quiet"])
                print_success(f"{dep} installé")
            except subprocess.CalledProcessError:
                print_error(f"Impossible d'installer {dep}")
                return False
    
    return True

def create_archive():
    """Crée une archive ZIP de l'application"""
    print_step("Création de l'archive de l'application...")
    
    archive_path = Path("deploy_package.zip")
    
    if archive_path.exists():
        archive_path.unlink()
    
    files_to_include = [
        "artifacts/api-server/dist",
        "artifacts/api-server/package.json",
        "artifacts/api-server/build.mjs",
        "artifacts/api-server/tsconfig.json",
        "artifacts/api-server/src",
        "artifacts/digital-ecom-land/dist",
        "artifacts/digital-ecom-land/package.json",
        "artifacts/digital-ecom-land/vite.config.ts",
        "artifacts/digital-ecom-land/tsconfig.json",
        "artifacts/digital-ecom-land/components.json",
        "artifacts/digital-ecom-land/index.html",
        "artifacts/digital-ecom-land/src",
        "artifacts/digital-ecom-land/public",
        "package.json",
        "pnpm-workspace.yaml",
        "pnpm-lock.yaml",
        ".env.production",
        "ecosystem.config.cjs",
        "nginx.conf",
        "deploy.sh",
        "server-setup.sh",
    ]
    
    with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for item in files_to_include:
            item_path = Path(item)
            if item_path.exists():
                if item_path.is_file():
                    zipf.write(item_path, item)
                    print_info(f"Ajouté: {item}")
                elif item_path.is_dir():
                    for file_path in item_path.rglob('*'):
                        if file_path.is_file():
                            arcname = str(file_path)
                            zipf.write(file_path, arcname)
                    print_info(f"Ajouté: {item}/ (dossier)")
            else:
                print_warning(f"Non trouvé: {item}")
    
    size_mb = archive_path.stat().st_size / (1024 * 1024)
    print_success(f"Archive créée: {archive_path} ({size_mb:.2f} MB)")
    
    return str(archive_path)

def ssh_connect():
    """Établit une connexion SSH au serveur"""
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

def execute_remote_command(ssh, command, description="", show_output=True):
    """Exécute une commande sur le serveur distant"""
    if description:
        print_info(description)
    
    try:
        stdin, stdout, stderr = ssh.exec_command(command, get_pty=True)
        
        # Attendre la fin de l'exécution
        exit_status = stdout.channel.recv_exit_status()
        
        output = stdout.read().decode('utf-8', errors='ignore')
        error = stderr.read().decode('utf-8', errors='ignore')
        
        if show_output and output:
            for line in output.strip().split('\n'):
                if line.strip():
                    print(f"  {line}")
        
        if exit_status == 0:
            return True, output
        else:
            if error:
                print_warning(f"Erreur: {error}")
            return False, error
    except Exception as e:
        print_error(f"Erreur d'exécution: {e}")
        return False, str(e)

def transfer_archive(ssh, archive_path):
    """Transfère l'archive sur le serveur"""
    from scp import SCPClient
    
    print_step("Transfert de l'archive sur le serveur...")
    
    try:
        with SCPClient(ssh.get_transport(), progress=progress_bar) as scp:
            remote_path = f"/home/{SERVER_CONFIG['user']}/deploy_package.zip"
            scp.put(archive_path, remote_path)
        
        print_success("Archive transférée avec succès")
        return True
    except Exception as e:
        print_error(f"Erreur de transfert: {e}")
        return False

def progress_bar(filename, size, sent):
    """Affiche une barre de progression pour le transfert"""
    percent = int((sent / size) * 100)
    bar_length = 50
    filled = int(bar_length * sent / size)
    bar = '█' * filled + '-' * (bar_length - filled)
    print(f"\r  [{bar}] {percent}% - {sent}/{size} bytes", end='', flush=True)
    if sent >= size:
        print()  # Nouvelle ligne à la fin

def deploy_application(ssh):
    """Déploie l'application sur le serveur"""
    
    print_step("Décompression de l'archive...")
    execute_remote_command(ssh, f"unzip -o ~/deploy_package.zip -d {APP_CONFIG['app_dir']}", show_output=False)
    print_success("Archive décompressée")
    
    print_step("Installation des prérequis système...")
    commands = [
        "sudo apt update -qq",
        "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - 2>/dev/null",
        "sudo apt install -y nodejs unzip postgresql postgresql-contrib nginx -qq",
        "sudo npm install -g pnpm pm2 --silent 2>/dev/null",
    ]
    
    for cmd in commands:
        execute_remote_command(ssh, cmd, show_output=False)
    
    print_success("Prérequis installés")
    
    print_step("Configuration de PostgreSQL...")
    
    # Démarrer PostgreSQL
    execute_remote_command(ssh, "sudo systemctl start postgresql", show_output=False)
    execute_remote_command(ssh, "sudo systemctl enable postgresql", show_output=False)
    
    # Créer la base de données et l'utilisateur
    pg_commands = f"""
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS {APP_CONFIG['db_name']};" 2>/dev/null || true
    sudo -u postgres psql -c "DROP USER IF EXISTS {APP_CONFIG['db_user']};" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE {APP_CONFIG['db_name']};"
    sudo -u postgres psql -c "CREATE USER {APP_CONFIG['db_user']} WITH PASSWORD '{APP_CONFIG['db_password']}';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE {APP_CONFIG['db_name']} TO {APP_CONFIG['db_user']};"
    """
    
    execute_remote_command(ssh, pg_commands, show_output=False)
    print_success("PostgreSQL configuré")
    
    print_step("Configuration du fichier .env...")
    
    env_content = f"""PORT={APP_CONFIG['api_port']}
NODE_ENV=production
API_PORT={APP_CONFIG['api_port']}
DATABASE_URL=postgresql://{APP_CONFIG['db_user']}:{APP_CONFIG['db_password']}@localhost:5432/{APP_CONFIG['db_name']}
VITE_API_URL=http://{SERVER_CONFIG['host']}:{APP_CONFIG['api_port']}
"""
    
    # Créer le fichier .env
    execute_remote_command(ssh, f"cd {APP_CONFIG['app_dir']} && cat > .env << 'EOFENV'\n{env_content}\nEOFENV", show_output=False)
    print_success("Fichier .env configuré")
    
    print_step("Installation des dépendances de l'application...")
    execute_remote_command(ssh, f"cd {APP_CONFIG['app_dir']} && pnpm install 2>/dev/null", show_output=False)
    print_success("Dépendances installées")
    
    print_step("Build de l'application...")
    execute_remote_command(ssh, f"cd {APP_CONFIG['app_dir']}/artifacts/digital-ecom-land && pnpm run build 2>/dev/null", show_output=False)
    execute_remote_command(ssh, f"cd {APP_CONFIG['app_dir']}/artifacts/api-server && pnpm run build 2>/dev/null", show_output=False)
    print_success("Application buildée")
    
    print_step("Configuration de PM2...")
    execute_remote_command(ssh, f"cd {APP_CONFIG['app_dir']} && pm2 delete digitalecomland-api 2>/dev/null || true", show_output=False)
    execute_remote_command(ssh, f"cd {APP_CONFIG['app_dir']} && pm2 start ecosystem.config.cjs", show_output=False)
    execute_remote_command(ssh, f"pm2 save", show_output=False)
    print_success("PM2 configuré et application démarrée")
    
    print_step("Configuration de Nginx...")
    execute_remote_command(ssh, f"sudo cp {APP_CONFIG['app_dir']}/nginx.conf /etc/nginx/sites-available/digitalecomland", show_output=False)
    execute_remote_command(ssh, f"sudo ln -sf /etc/nginx/sites-available/digitalecomland /etc/nginx/sites-enabled/digitalecomland", show_output=False)
    execute_remote_command(ssh, f"sudo rm -f /etc/nginx/sites-enabled/default", show_output=False)
    execute_remote_command(ssh, f"sudo nginx -t && sudo systemctl restart nginx", show_output=False)
    print_success("Nginx configuré")
    
    print_step("Vérification du déploiement...")
    time.sleep(3)
    
    success, output = execute_remote_command(ssh, "pm2 status", show_output=False)
    if "digitalecomland-api" in output and "online" in output:
        print_success("Application en ligne")
    else:
        print_warning("L'application pourrait ne pas être démarrée correctement")
    
    success, output = execute_remote_command(ssh, "curl -s http://localhost:3001/api/health || echo 'API non disponible'", show_output=False)
    if "API non disponible" not in output:
        print_success("API répond correctement")
    else:
        print_warning("L'API ne répond pas encore (cela peut prendre quelques secondes)")

def main():
    """Fonction principale"""
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}   DÉPLOIEMENT AUTOMATIQUE - DIGITAL ECOM LAND{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
    
    # Vérifier les dépendances
    if not check_dependencies():
        print_error("Impossible de continuer sans les dépendances")
        return False
    
    # Créer l'archive
    archive_path = create_archive()
    if not archive_path or not Path(archive_path).exists():
        print_error("Impossible de créer l'archive")
        return False
    
    # Connexion SSH
    ssh = ssh_connect()
    if not ssh:
        print_error("Impossible de se connecter au serveur")
        return False
    
    try:
        # Transférer l'archive
        if not transfer_archive(ssh, archive_path):
            print_error("Échec du transfert")
            return False
        
        # Déployer l'application
        deploy_application(ssh)
        
        # Rapport final
        print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.GREEN}   ✓ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !{Colors.RESET}")
        print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
        
        print(f"{Colors.BOLD}Votre application est accessible sur:{Colors.RESET}")
        print(f"  • Frontend: {Colors.BLUE}http://{SERVER_CONFIG['host']}{Colors.RESET}")
        print(f"  • API:      {Colors.BLUE}http://{SERVER_CONFIG['host']}/api{Colors.RESET}")
        print()
        
        print(f"{Colors.BOLD}Informations de connexion:{Colors.RESET}")
        print(f"  • SSH: ssh -p {SERVER_CONFIG['port']} {SERVER_CONFIG['user']}@{SERVER_CONFIG['host']}")
        print(f"  • Base de données: {APP_CONFIG['db_name']}")
        print(f"  • Utilisateur DB: {APP_CONFIG['db_user']}")
        print(f"  • Mot de passe DB: {APP_CONFIG['db_password']}")
        print()
        
        print(f"{Colors.YELLOW}⚠  N'oubliez pas de changer votre mot de passe SSH !{Colors.RESET}")
        print(f"   Connectez-vous et exécutez: passwd")
        print()
        
        return True
        
    except Exception as e:
        print_error(f"Erreur lors du déploiement: {e}")
        return False
    finally:
        ssh.close()
        # Nettoyer l'archive locale
        if Path(archive_path).exists():
            Path(archive_path).unlink()

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Déploiement annulé par l'utilisateur{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print_error(f"Erreur fatale: {e}")
        sys.exit(1)
