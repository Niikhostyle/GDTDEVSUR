/**
 * Copia dist/client → public_html para que Apache/LiteSpeed sirva JS/CSS/fuentes/imágenes
 * directamente (sin pasar por el proxy PHP → Node). Se ejecuta como `postbuild`.
 * Además genera index.html (snapshot SSR) para que `/` sea un archivo estático
 * y no dependa del proxy si LiteSpeed/CF falla en algunos clientes.
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

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function snapshotHome() {
  const port = process.env.PORT || "3055";
  const host = process.env.HOST || "127.0.0.1";
  const url = `http://${host}:${port}/`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/html", "User-Agent": "gdtdevsur-publish-static" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.warn(`[publish-static] snapshot omitido: HTTP ${res.status}`);
      return;
    }
    let html = await res.text();
    if (!html || html.length < 1000) {
      console.warn(`[publish-static] snapshot omitido: cuerpo demasiado corto (${html.length})`);
      return;
    }
    // Forzar contenido visible (GSAP no debe poder dejar la página en blanco)
    html = html.replace(
      "<head>",
      '<head><style id="boot-visible">[data-hero-content],.reveal-item,.vox-card,.hero-char,.hero-word,[data-hero-eyebrow],[data-hero-copy],[data-hero-cta],[data-hero-cta-wrap]{opacity:1!important;transform:none!important;translate:none!important}</style>',
    );
    await fs.writeFile(path.join(dest, "index.html"), html, "utf8");
    console.log(`[publish-static] index.html snapshot (${html.length} bytes)`);
  } catch (err) {
    console.warn(`[publish-static] snapshot omitido: ${err?.message || err}`);
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

// Snapshot tras copiar assets (PM2 debe estar up; si no, se omite)
await snapshotHome();
