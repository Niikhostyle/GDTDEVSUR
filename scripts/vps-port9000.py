"""Requiere VPS_HOST, VPS_USER y VPS_KEY_PATH o VPS_PASSWORD (ver vps_ssh.py)."""
from vps_ssh import ssh_connect

ssh = ssh_connect()

cmds = [
    "curl -sI --max-time 5 http://127.0.0.1:9000 | head -20",
    "curl -sI --max-time 5 http://127.0.0.1 | head -20",
    "curl -sI --max-time 5 -H 'Host: gdtdevsur.cl' http://127.0.0.1 | head -30",
    "ls -la ~/public_html ../ 2>/dev/null; ls -la ~",
    "find ~ -maxdepth 3 -type d 2>/dev/null",
    "ps aux | head -5; ps -u gdtdevsu1 -o pid,cmd --sort=pid | head -40",
]

for c in cmds:
    print("===", c)
    _, stdout, stderr = ssh.exec_command(c, timeout=45)
    print(stdout.read().decode(errors="replace")[:3500] or "(empty)")
    err = stderr.read().decode(errors="replace")
    if err.strip():
        print("ERR:", err[:500])

ssh.close()
