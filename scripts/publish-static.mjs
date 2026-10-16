/**
 * Copia dist/client → public_html para que Apache/LiteSpeed sirva JS/CSS/fuentes/imágenes
 * directamente (sin pasar por el proxy PHP → Node). Se ejecuta como `postbuild`.
 *
 * NO publica HTML de páginas dinámicas (index.html, about/, etc.): el contenido CMS
 * debe salir siempre de SSR Node vía index.php. Solo assets estáticos.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "dist", "client");
const dest = path.resolve(process.env.PUBLIC_HTML_DIR || path.join(root, "..", "public_html"));
const keep = new Set([
  "index.php",
  ".htaccess",
  ".well-known",
  "cgi-bin",
  "ping.html",
  "estado-2026.html",
  "index.full.html",
]);

/** HTML de rutas CMS — no deben quedar como archivos estáticos en public_html. */
const stripHtml = new Set(["index.html", "about"]);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(dest)) || !(await exists(src))) {
  console.log(`[publish-static] omitido (no existe ${dest} o ${src})`);
  process.exit(0);
}

for (const entry of await fs.readdir(dest)) {
  if (keep.has(entry)) continue;
  await fs.rm(path.join(dest, entry), { recursive: true, force: true });
}

await fs.cp(src, dest, { recursive: true });
console.log(`[publish-static] ${src} → ${dest}`);

for (const name of stripHtml) {
  await fs.rm(path.join(dest, name), { recursive: true, force: true });
}
console.log("[publish-static] HTML dinámico eliminado (SSR only via index.php)");
