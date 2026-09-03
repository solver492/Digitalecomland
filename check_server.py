#!/usr/bin/env python3
"""Diagnostic du serveur"""

import sys
import os

SERVER_CONFIG = {
    'host': '147.93.54.128',
    'port': '65002',
    'user': 'u696346042',
    'password': os.environ.get('HOSTINGER_SSH_PASSWORD'),
}

def main():
    try:
        import paramiko
    except:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "paramiko", "--quiet"])
        import paramiko
    
    print("Connexion au serveur...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        hostname=SERVER_CONFIG['host'],
        port=int(SERVER_CONFIG['port']),
        username=SERVER_CONFIG['user'],
        password=SERVER_CONFIG['password']
    )
    
    print("\n=== DIAGNOSTIC DU SERVEUR ===\n")
    
    commands = [
        ("Type de serveur", "uname -a"),
        ("Répertoire home", "pwd"),
        ("Structure", "ls -la"),
        ("Commandes disponibles", "which node npm pnpm pm2 nginx apache2 httpd"),
        ("Node.js", "node --version 2>&1 || echo 'Non installé'"),
        ("NPM", "npm --version 2>&1 || echo 'Non installé'"),
        ("Processus en cours", "ps aux | grep -E 'node|nginx|apache|httpd' | head -20"),
        ("Variables PATH", "echo $PATH"),
        ("Panel de contrôle", "ls -la ~/domains ~/public_html ~/.htaccess 2>/dev/null || echo 'Structure standard'"),
        ("Fichiers web", "ls -la ~/digitalecomland 2>/dev/null || echo 'Pas encore créé'"),
    ]
    
    for desc, cmd in commands:
        print(f"\n[{desc}]")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        output = stdout.read().decode('utf-8', errors='ignore')
        error = stderr.read().decode('utf-8', errors='ignore')
        print(output if output else error)
    
    ssh.close()

if __name__ == "__main__":
    main()
