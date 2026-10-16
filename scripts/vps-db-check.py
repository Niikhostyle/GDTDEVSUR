"""Requiere VPS_HOST, VPS_USER y VPS_KEY_PATH o VPS_PASSWORD (ver vps_ssh.py)."""
from vps_ssh import ssh_connect

ssh = ssh_connect()

cmds = [
    "mysql -e 'SHOW GRANTS;'",
    "mysql -e 'SELECT USER(), CURRENT_USER();'",
    # try common db names
    "mysql gdtdevsu1 -e 'SELECT 1 AS ok;' 2>&1",
    "mysql -e \"CREATE DATABASE IF NOT EXISTS gdtdevsu1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\" 2>&1",
    "mysql -e 'SHOW DATABASES;'",
]

for c in cmds:
    print("===", c)
    _, stdout, stderr = ssh.exec_command(c, timeout=60)
    print(stdout.read().decode(errors="replace")[:3000])
    err = stderr.read().decode(errors="replace")
    if err.strip():
        print("ERR:", err[:1000])

ssh.close()
