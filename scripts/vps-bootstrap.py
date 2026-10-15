"""Requiere VPS_HOST, VPS_USER y VPS_KEY_PATH o VPS_PASSWORD (ver vps_ssh.py)."""
from vps_ssh import ssh_connect


def run(ssh, cmd, timeout=180):
    print("===", cmd[:120])
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    if out:
        print(out[:4000])
    if err.strip():
        print("ERR:", err[:1500])
    return out, err


def main():
    ssh = ssh_connect()

    run(ssh, "mysql -e 'SHOW DATABASES;'")
    run(
        ssh,
        "mysql -e \"CREATE DATABASE IF NOT EXISTS gdtdevsur CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; SHOW DATABASES LIKE 'gdtdevsur';\"",
    )

    # nvm + node
    run(
        ssh,
        "curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash",
        timeout=120,
    )
    run(
        ssh,
        'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm install 22; nvm alias default 22; node -v; npm -v',
        timeout=300,
    )

    # pm2
    run(
        ssh,
        'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; npm install -g pm2; pm2 -v',
        timeout=180,
    )

    ssh.close()
    print("BOOTSTRAP DONE")


if __name__ == "__main__":
    main()
