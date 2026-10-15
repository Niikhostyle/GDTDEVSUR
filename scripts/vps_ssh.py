"""Conexión SSH compartida para los scripts vps-*.py.

Credenciales SOLO desde variables de entorno (nunca en el código):
  VPS_HOST       host o IP del servidor (obligatorio)
  VPS_USER       usuario SSH (obligatorio)
  VPS_PORT       puerto SSH (opcional, por defecto 22)
  VPS_KEY_PATH   ruta a la clave privada (recomendado)
  VPS_PASSWORD   contraseña SSH (alternativa, desaconsejada)
Si no se define ni VPS_KEY_PATH ni VPS_PASSWORD se usa ssh-agent / ~/.ssh.
"""
from __future__ import annotations

import os
import sys

import paramiko


def env(name: str, required: bool = True) -> str | None:
    value = os.environ.get(name, "").strip()
    if required and not value:
        sys.exit(f"ERROR: falta la variable de entorno {name}. Ver cabecera de scripts/vps_ssh.py.")
    return value or None


def ssh_connect(timeout: int = 30) -> paramiko.SSHClient:
    host = env("VPS_HOST")
    user = env("VPS_USER")
    port = int(env("VPS_PORT", required=False) or 22)
    key_path = env("VPS_KEY_PATH", required=False)
    password = env("VPS_PASSWORD", required=False)

    ssh = paramiko.SSHClient()
    ssh.load_system_host_keys()
    ssh.set_missing_host_key_policy(paramiko.WarningPolicy())
    kwargs: dict = {"port": port, "username": user, "timeout": timeout}
    if key_path:
        kwargs["key_filename"] = os.path.expanduser(key_path)
    elif password:
        kwargs["password"] = password
        kwargs["allow_agent"] = False
        kwargs["look_for_keys"] = False
    ssh.connect(host, **kwargs)
    return ssh
