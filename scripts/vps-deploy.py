"""Deploy GDT DevSur al VPS: upload, build, publicación estática, PM2, proxy PHP.

Uso:  python scripts/vps-deploy.py [--seed]

Conexión SSH (ver scripts/vps_ssh.py): VPS_HOST, VPS_USER y VPS_KEY_PATH
(recomendado) o VPS_PASSWORD. Opcional: VPS_REMOTE_HOME.

El .env remoto NUNCA se sobrescribe. Solo si no existe se crea a partir de
estas variables locales (todas obligatorias en ese caso):
  DATABASE_URL (mysql://..., no SQLite), ADMIN_SESSION_SECRET (>= 32 caracteres)

Los usuarios admin viven en la tabla admin_users (hash bcrypt), no en .env.
Para crear o cambiar la contraseña, en el servidor:
  npm run admin:password -- niikhostyle@gmail.com

--seed  vuelca data/content*.json a la base (sobrescribe ediciones del CMS).
"""
from __future__ import annotations

import os
import shlex
import sys
import tarfile
from pathlib import Path

import paramiko

from vps_ssh import ssh_connect as _ssh_connect

REMOTE_HOME = os.environ.get("VPS_REMOTE_HOME", "/var/www/f511adf8-af5e-4a83-980c-bd6fd1d378c2").rstrip("/")
REMOTE_APP = f"{REMOTE_HOME}/app"
REMOTE_PUBLIC = f"{REMOTE_HOME}/public_html"
LOCAL_ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = LOCAL_ROOT / "deploy-gdtdevsur.tar.gz"

EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    ".astro",
    "dist",
    ".pm2",
    ".nvm",
    ".npm",
    "agent-transcripts",
    "terminals",
    ".cursor",
}
EXCLUDE_FILES = {
    "deploy-gdtdevsur.tar.gz",
    "sessions.json",
    "submissions.json",
}


def should_exclude(path: Path) -> bool:
    parts = set(path.parts)
    if parts & EXCLUDE_DIRS:
        return True
    if path.name in EXCLUDE_FILES:
        return True
    if path.name.startswith(".env") and path.name != ".env.example":
        return True
    if path.suffix in {".db", ".db-journal", ".db-wal", ".db-shm", ".log", ".bak"}:
        return True
    return False


def make_archive() -> None:
    print("Creating archive...")
    if ARCHIVE.exists():
        ARCHIVE.unlink()
    with tarfile.open(ARCHIVE, "w:gz") as tar:
        for root, dirs, files in os.walk(LOCAL_ROOT):
            root_path = Path(root)
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]
            # keep .env.example and hidden config that matters
            for name in files:
                fp = root_path / name
                rel = fp.relative_to(LOCAL_ROOT)
                if should_exclude(rel):
                    continue
                tar.add(fp, arcname=str(rel).replace("\\", "/"))
    print("Archive size MB:", round(ARCHIVE.stat().st_size / 1024 / 1024, 2))


def ssh_connect() -> paramiko.SSHClient:
    return _ssh_connect(timeout=40)


def run(ssh: paramiko.SSHClient, cmd: str, timeout: int = 600) -> tuple[str, str]:
    print(">>>", cmd[:160])
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    if out.strip():
        print(out[-4000:])
    if err.strip():
        print("ERR:", err[-2000:])
    return out, err


PHP_PROXY = r"""<?php
// Reverse proxy → Astro (PM2) en 127.0.0.1:3055
$targetHost = '127.0.0.1';
$targetPort = 3055;
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$url = "http://{$targetHost}:{$targetPort}{$uri}";

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$headers = [];
foreach (getallheaders() ?: [] as $k => $v) {
  $lk = strtolower($k);
  if (in_array($lk, ['host', 'content-length', 'connection', 'accept-encoding'], true)) continue;
  $headers[] = "{$k}: {$v}";
}
$headers[] = 'Host: ' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
$headers[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '');
$headers[] = 'X-Forwarded-Proto: ' . ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
$headers[] = 'X-Forwarded-Host: ' . ($_SERVER['HTTP_HOST'] ?? '');

$body = null;
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
  $body = file_get_contents('php://input');
}

$ch = curl_init($url);
curl_setopt_array($ch, [
  CURLOPT_CUSTOMREQUEST => $method,
  CURLOPT_HTTPHEADER => $headers,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HEADER => true,
  CURLOPT_FOLLOWLOCATION => false,
  CURLOPT_TIMEOUT => 120,
  CURLOPT_POSTFIELDS => $body,
]);
$resp = curl_exec($ch);
if ($resp === false) {
  http_response_code(502);
  header('Content-Type: text/plain; charset=utf-8');
  echo "App offline. Arrancá PM2 (puerto 3055).\n" . curl_error($ch);
  exit;
}
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

$rawHeaders = substr($resp, 0, $headerSize);
$rawBody = substr($resp, $headerSize);
http_response_code($status);
foreach (explode("\r\n", $rawHeaders) as $line) {
  if ($line === '' || stripos($line, 'HTTP/') === 0) continue;
  if (stripos($line, 'Transfer-Encoding:') === 0) continue;
  if (stripos($line, 'Connection:') === 0) continue;
  header($line, false);
}
echo $rawBody;
"""

HTACCESS = """Options -Indexes

<FilesMatch "^\\.">
  Require all denied
</FilesMatch>
<FilesMatch "\\.(env|bak|sql|sqlite|db|log|tgz|tar|gz|zip)$">
  Require all denied
</FilesMatch>

RewriteEngine On
RewriteRule (^|/)\\.(?!well-known/) - [F,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [L]

<IfModule mod_mime.c>
  AddType font/woff2 .woff2
  AddType image/webp .webp
  AddType image/svg+xml .svg
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json application/xml image/svg+xml
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "\\.(js|css|woff2|webp|svg|ico|jpg|png)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
  <If "%{REQUEST_URI} =~ m#^/_astro/#">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </If>
</IfModule>
"""

def remote_exists(sftp: paramiko.SFTPClient, path: str) -> bool:
    try:
        sftp.stat(path)
        return True
    except FileNotFoundError:
        return False


def build_prod_env() -> str:
    """Arma el .env de producción desde variables locales; aborta si faltan o son débiles."""
    required = ["DATABASE_URL", "ADMIN_SESSION_SECRET"]
    values = {k: os.environ.get(k, "").strip() for k in required}
    missing = [k for k, v in values.items() if not v]
    if missing:
        sys.exit(
            "ERROR: el servidor no tiene .env y faltan variables para crearlo: "
            + ", ".join(missing)
        )
    if not values["DATABASE_URL"].startswith(("mysql://", "mariadb://")):
        sys.exit("ERROR: DATABASE_URL debe ser mysql:// o mariadb:// (no SQLite).")
    if len(values["ADMIN_SESSION_SECRET"]) < 32:
        sys.exit("ERROR: ADMIN_SESSION_SECRET demasiado corto (mínimo 32 caracteres).")
    return (
        "PUBLIC_SITE_URL=https://gdtdevsur.cl\n"
        f'DATABASE_URL="{values["DATABASE_URL"]}"\n'
        f"ADMIN_SESSION_SECRET={values['ADMIN_SESSION_SECRET']}\n"
        "HOST=127.0.0.1\n"
        "PORT=3055\n"
        "NODE_ENV=production\n"
    )


def main() -> None:
    seed = "--seed" in sys.argv[1:]
    ssh = ssh_connect()
    sftp = ssh.open_sftp()

    remote_env = f"{REMOTE_APP}/.env"
    prod_env = None if remote_exists(sftp, remote_env) else build_prod_env()

    make_archive()

    run(ssh, f"mkdir -p {REMOTE_APP} {REMOTE_PUBLIC}")
    remote_tar = f"{REMOTE_APP}/deploy-gdtdevsur.tar.gz"
    print("Uploading archive...")
    sftp.put(str(ARCHIVE), remote_tar)
    print("Upload done")

    run(ssh, f"cd {REMOTE_APP} && tar -xzf deploy-gdtdevsur.tar.gz && rm -f deploy-gdtdevsur.tar.gz")

    if prod_env is None:
        print(".env remoto existente: se conserva sin cambios")
    else:
        print("Creando .env remoto (no existía)")
        with sftp.file(remote_env, "w") as f:
            f.write(prod_env)
        sftp.chmod(remote_env, 0o600)
        print("Recordá crear el admin en el servidor: npm run admin:password -- niikhostyle@gmail.com")
    with sftp.file(f"{REMOTE_PUBLIC}/index.php", "w") as f:
        f.write(PHP_PROXY)
    with sftp.file(f"{REMOTE_PUBLIC}/.htaccess", "w") as f:
        f.write(HTACCESS)

    nvm = 'export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"'
    run(
        ssh,
        f"{nvm}; cd {REMOTE_APP} && npm install && npx prisma generate && npx prisma db push",
        timeout=900,
    )
    if seed:
        run(ssh, f"{nvm}; cd {REMOTE_APP} && node --env-file=.env scripts/seed-db.mjs", timeout=300)
    # build en el servidor (deps nativas linux); postbuild publica estáticos en public_html
    run(ssh, f"{nvm}; cd {REMOTE_APP} && npm run build", timeout=900)
    app = shlex.quote(REMOTE_APP)
    run(
        ssh,
        f"{nvm}; cd {app} && if [ -f ecosystem.config.cjs ]; then pm2 startOrRestart ecosystem.config.cjs --update-env; "
        "else pm2 delete gdtdevsur 2>/dev/null; HOST=127.0.0.1 PORT=3055 pm2 start ./dist/server/entry.mjs --name gdtdevsur --update-env; fi",
    )
    run(ssh, f"{nvm}; pm2 save; pm2 status; curl -sI --max-time 5 http://127.0.0.1:3055 | head -15")
    run(ssh, f"curl -sI --max-time 8 -H 'Host: gdtdevsur.cl' http://127.0.0.1/ | head -20")

    sftp.close()
    ssh.close()
    print("DEPLOY FINISHED")


if __name__ == "__main__":
    main()
