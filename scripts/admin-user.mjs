#!/usr/bin/env node
/**
 * Crea o cambia la contraseña de un usuario admin (tabla admin_users).
 *
 *   npm run admin:password -- correo@ejemplo.com
 *
 * La contraseña se pide por teclado (oculta). Para uso no interactivo se
 * puede pasar en la variable de entorno ADMIN_NEW_PASSWORD al ejecutar.
 * Opciones: --list (listar admins), --delete <email> (eliminar).
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const MIN_LENGTH = 12;
const COST = 12;

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      let data = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (c) => (data += c));
      stdin.on("end", () => resolve(data.split(/\r?\n/)[0] ?? ""));
      stdin.on("error", reject);
      return;
    }
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (ch) => {
      for (const c of ch) {
        if (c === "\r" || c === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          return resolve(value);
        }
        if (c === "\u0003") {
          stdin.setRawMode(false);
          stdout.write("\n");
          process.exit(130);
        }
        if (c === "\u007f" || c === "\b") value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on("data", onData);
  });
}

const args = process.argv.slice(2);
const prisma = new PrismaClient();

try {
  if (args[0] === "--list") {
    const users = await prisma.adminUser.findMany({
      select: { email: true, createdAt: true, lastLoginAt: true },
      orderBy: { createdAt: "asc" },
    });
    console.table(users);
  } else if (args[0] === "--delete") {
    const email = args[1]?.trim().toLowerCase();
    if (!email) throw new Error("Uso: npm run admin:password -- --delete correo@ejemplo.com");
    const res = await prisma.adminUser.deleteMany({ where: { email } });
    console.log(res.count ? `Eliminado: ${email}` : `No existe: ${email}`);
  } else {
    const email = args[0]?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Uso: npm run admin:password -- correo@ejemplo.com");
    }
    let password = process.env.ADMIN_NEW_PASSWORD;
    if (!password) {
      password = await readHidden("Nueva contraseña: ");
      if (process.stdin.isTTY) {
        const confirm = await readHidden("Repetir contraseña: ");
        if (password !== confirm) throw new Error("Las contraseñas no coinciden");
      }
    }
    if (!password || password.length < MIN_LENGTH) {
      throw new Error(`La contraseña debe tener al menos ${MIN_LENGTH} caracteres`);
    }
    const passwordHash = await bcrypt.hash(password, COST);
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });
    console.log(existing ? `Contraseña actualizada: ${email}` : `Admin creado: ${email}`);
  }
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
