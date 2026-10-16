"""Requiere VPS_HOST, VPS_USER y VPS_KEY_PATH o VPS_PASSWORD (ver vps_ssh.py)."""
from vps_ssh import ssh_connect

ssh = ssh_connect()

cmds = [
    "ls /usr/local/lsws 2>/dev/null | head",
    "ls /usr/local/bin 2>/dev/null | head",
    "command -v openlitespeed; command -v lshttpd; command -v clpctl; command -v cloudpanelfy",
    "ls /home/clp 2>/dev/null | head; ls /etc/cloudpanel 2>/dev/null | head",
    "find /etc -iname '*f511adf8*' 2>/dev/null | head -20",
    "find /usr/local -iname '*f511adf8*' 2>/dev/null | head -20",
    "ls -la /var/www 2>/dev/null | head -30",
    "cat /etc/powerdns/zones/gdtdevsur.cl.db 2>/dev/null | head -40",
    "ss -tlnp 2>/dev/null | head -40 || netstat -tlnp 2>/dev/null | head -40",
]

for c in cmds:
    print("===", c)
    _, stdout, stderr = ssh.exec_command(c, timeout=60)
    print(stdout.read().decode(errors="replace")[:4000] or "(empty)")
    err = stderr.read().decode(errors="replace")
    if err.strip():
        print("ERR:", err[:600])

ssh.close()
