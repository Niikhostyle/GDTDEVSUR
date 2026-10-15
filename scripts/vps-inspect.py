"""Requiere VPS_HOST, VPS_USER y VPS_KEY_PATH o VPS_PASSWORD (ver vps_ssh.py)."""
from vps_ssh import ssh_connect

ssh = ssh_connect()

cmds = [
    "cat ~/.my.cnf",
    "ls -la ~/public_html",
    "mysql --version 2>&1; command -v mysql; command -v mariadb",
    "command -v node; command -v npm; command -v nvm; ls -la ~/.nvm 2>&1 | head",
    "id; groups",
    "ls /usr/bin/node /usr/local/bin/node 2>&1",
    "type docker 2>&1; type podman 2>&1; type systemctl 2>&1",
    "php -v 2>&1 | head -2",
    "ls ~/public_html -la; find ~/public_html -maxdepth 2 -type f 2>/dev/null | head -30",
    "env | grep -E 'PATH|HOME|USER' | head",
]

for c in cmds:
    print("===", c)
    _, stdout, stderr = ssh.exec_command(c, timeout=45)
    print(stdout.read().decode(errors="replace")[:3500])
    err = stderr.read().decode(errors="replace")
    if err.strip():
        print("ERR:", err[:500])

ssh.close()
print("DONE")
