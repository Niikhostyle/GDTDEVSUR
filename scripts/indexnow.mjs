/**
 * Notifica a buscadores compatibles con IndexNow (Bing → ChatGPT/Copilot, Yandex, Seznam, Naver…)
 * las URLs del sitemap. Uso: `npm run indexnow` (después de publicar cambios).
 * La clave es pública por diseño: se sirve en https://<host>/<clave>.txt desde /public.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = (process.env.PUBLIC_SITE_URL || "https://gdtdevsur.cl").replace(/\/$/, "");
const host = new URL(site).host;

const keyFile = (await fs.readdir(path.join(root, "public"))).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error("[indexnow] No hay archivo de clave <32 hex>.txt en public/");
  process.exit(1);
}
const key = keyFile.replace(/\.txt$/, "");
const keyLocation = `${site}/${keyFile}`;

const keyCheck = await fetch(keyLocation);
const served = (await keyCheck.text()).trim();
if (!keyCheck.ok || served !== key) {
  console.error(`[indexnow] ${keyLocation} no devuelve la clave (HTTP ${keyCheck.status}). ¿Falta desplegar?`);
  process.exit(1);
}

const sitemap = await (await fetch(`${site}/sitemap.xml`)).text();
const urlList = [
  ...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"))),
];
if (!urlList.length) {
  console.error("[indexnow] El sitemap no tiene URLs");
  process.exit(1);
}

const payload = JSON.stringify({ host, key, keyLocation, urlList });
const endpoints = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

let failed = 0;
for (const endpoint of endpoints) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: payload,
    });
    const ok = res.status === 200 || res.status === 202;
    if (!ok) failed++;
    console.log(`[indexnow] ${endpoint} → HTTP ${res.status}${ok ? " ✓" : ` ${(await res.text()).slice(0, 200)}`}`);
  } catch (err) {
    failed++;
    console.log(`[indexnow] ${endpoint} → error ${err.message}`);
  }
}
console.log(`[indexnow] ${urlList.length} URLs enviadas:\n  ${urlList.join("\n  ")}`);
process.exit(failed === endpoints.length ? 1 : 0);
