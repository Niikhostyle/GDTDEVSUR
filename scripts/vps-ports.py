"""Requiere VPS_HOST, VPS_USER y VPS_KEY_PATH o VPS_PASSWORD (ver vps_ssh.py)."""
from vps_ssh import ssh_connect

ssh = ssh_connect()

cmds = [
    "ls -la /etc/nginx/sites-enabled 2>/dev/null | head",
    "ls /etc/apache2/sites-enabled 2>/dev/null | head",
    "ls /etc/httpd 2>/dev/null | head",
    "python3 -c \"import socket;s=socket.socket();s.bind(('127.0.0.1',3055));print('bind3055ok');s.close()\" 2>&1",
    "cat /etc/hosts | head -20",
    "ls /home/*/conf 2>/dev/null | head",
    "find /etc -iname '*gdtdev*' 2>/dev/null | head",
    "find /etc/nginx -iname '*f511*' 2>/dev/null | head",
    "ls /etc/nginx/conf.d 2>/dev/null | head",
    "printenv | grep -i domain; printenv | grep -i site",
]

for c in cmds:
    print("===", c)
    _, stdout, stderr = ssh.exec_command(c, timeout=45)
    print(stdout.read().decode(errors="replace")[:2500] or "(empty)")
    err = stderr.read().decode(errors="replace")
    if err.strip():
        print("ERR:", err[:500])

ssh.close()
