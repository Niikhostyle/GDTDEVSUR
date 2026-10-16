/**
 * Auditoría SEO / GEO básica. Uso:
 *   npm run check:seo                      → https://gdtdevsur.cl
 *   node scripts/check-seo.mjs http://127.0.0.1:3055
 */
const base = (process.argv[2] || process.env.SEO_BASE || "https://gdtdevsur.cl").replace(/\/$/, "");
const site = "https://gdtdevsur.cl";
let failures = 0;

function ok(cond, label, detail = "") {
  if (!cond) failures++;
  console.log(`${cond ? "  ✓" : "  ✗"} ${label}${detail ? ` — ${detail}` : ""}`);
}

const pick = (html, re) => html.match(re)?.[1] ?? null;
const get = (path, init) => fetch(base + path, { redirect: "manual", ...init });

function jsonLdNodes(html) {
  const nodes = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]);
    nodes.push(...(data["@graph"] || [data]));
  }
  return nodes;
}
const hasType = (nodes, t) => nodes.some((n) => [].concat(n["@type"]).includes(t));

async function checkPage(path, { lang, expectFaq = false }) {
  console.log(`\n--- ${path}`);
  const r = await get(path);
  const h = await r.text();
  ok(r.status === 200, "HTTP 200", String(r.status));
  ok(!/noindex/i.test(r.headers.get("x-robots-tag") || ""), "sin X-Robots-Tag noindex");
  const title = pick(h, /<title>([^<]+)<\/title>/) || "";
  ok(title.includes("GDT DevSur") && title.length <= 65, "title con marca y ≤65", `${title.length}: ${title}`);
  const desc = pick(h, /name="description" content="([^"]+)/) || "";
  ok(desc.length >= 70 && desc.length <= 160 && !desc.endsWith("…"), "description 70–160 sin cortar", `${desc.length}`);
  ok(/name="robots" content="index, follow/.test(h), "meta robots index,follow");
  const expected = path.split("?")[0] === "/" ? `${site}/` : `${site}${path.split("?")[0]}`;
  const canonical = pick(h, /rel="canonical" href="([^"]+)/);
  const canonicalExpected = lang === "en" ? `${expected}?lang=en` : expected;
  ok(canonical === canonicalExpected, "canonical", canonical);
  ok(pick(h, /hreflang="es-CL" href="([^"]+)/) === expected, "hreflang es-CL");
  ok(pick(h, /hreflang="en" href="([^"]+)/) === `${expected}?lang=en`, "hreflang en");
  ok(pick(h, /hreflang="x-default" href="([^"]+)/) === expected, "hreflang x-default");
  ok(pick(h, /<html lang="([^"]+)"/) === (lang === "en" ? "en" : "es-CL"), "html lang");
  ok((h.match(/<h1[\s>]/g) || []).length === 1, "un solo H1");
  ok(/property="og:image" content="https:\/\//.test(h), "og:image absoluta");
  ok(/name="twitter:card"/.test(h), "twitter:card");
  ok(/rel="icon" href="\/favicon\.ico"/.test(h), "favicon.ico enlazado");
  const text = h
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const definition = lang === "en" ? /GDT DevSur is a Chilean/ : /GDT DevSur es una agencia chilena/;
  ok(definition.test(text), "frase definitoria visible en HTML del servidor");
  ok(!/email-protection/.test(h), "email sin ofuscar por Cloudflare");
  const imgs = h.match(/<img\b[^>]*>/g) || [];
  ok(imgs.every((i) => /\balt=/.test(i)), "todas las <img> con alt", `${imgs.length} imgs`);

  let nodes = [];
  try {
    nodes = jsonLdNodes(h);
    ok(true, "JSON-LD parsea", `${nodes.length} nodos`);
  } catch (e) {
    ok(false, "JSON-LD parsea", e.message);
  }
  const org = nodes.find((n) => n["@id"] === `${site}/#organization`);
  ok(Boolean(org), "Organization con @id");
  if (org) {
    ok([].concat(org["@type"]).includes("ProfessionalService"), "Organization + ProfessionalService");
    ok(/\.png$/.test(org.logo?.url || ""), "logo PNG", org.logo?.url);
    ok((org.alternateName || []).includes("gdtdevsur"), "alternateName incluye gdtdevsur");
    ok(Boolean(org.email && org.telephone), "email + teléfono");
    ok((org.sameAs || []).length > 0, "sameAs", (org.sameAs || []).join(", "));
  }
  ok(hasType(nodes, "WebSite"), "WebSite");
  ok(hasType(nodes, "BreadcrumbList"), "BreadcrumbList");
  if (expectFaq) {
    const faq = nodes.find((n) => n["@type"] === "FAQPage");
    ok(Boolean(faq) && faq.mainEntity.some((q) => /GDT DevSur/.test(q.name)), "FAQPage con preguntas de marca");
  }
  const gv = pick(h, /name="google-site-verification" content="([^"]+)/);
  const bv = pick(h, /name="msvalidate.01" content="([^"]+)/);
  console.log(`  · google-site-verification: ${gv || "(no configurado)"} · msvalidate.01: ${bv || "(no configurado)"}`);
}

await checkPage("/", { lang: "es", expectFaq: true });
await checkPage("/?lang=en", { lang: "en", expectFaq: true });
await checkPage("/acerca-de", { lang: "es" });
await checkPage("/acerca-de?lang=en", { lang: "en" });

console.log("\n--- robots.txt");
const robots = await (await get("/robots.txt")).text();
ok(robots.includes(`Sitemap: ${site}/sitemap.xml`), "referencia al sitemap");
for (const bot of ["Googlebot", "Google-Extended", "Bingbot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Applebot-Extended"]) {
  ok(new RegExp(`User-agent: ${bot}\\nAllow: /`).test(robots), `permite ${bot}`);
}
ok(!/Disallow: \/\s*$/m.test(robots), "sin Disallow: / global");
ok(/Disallow: \/admin/.test(robots) && /Disallow: \/api\//.test(robots), "bloquea /admin y /api");

console.log("\n--- sitemap.xml");
const sm = await get("/sitemap.xml");
const smText = await sm.text();
ok(sm.status === 200 && /xml/.test(sm.headers.get("content-type") || ""), "sitemap XML 200");
const locs = [...smText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok(locs.length >= 4 && locs.every((l) => l.startsWith(site)), "URLs con host correcto", locs.join(" "));
ok(/<lastmod>\d{4}-\d{2}-\d{2}T/.test(smText), "lastmod");
ok(/xhtml:link rel="alternate" hreflang="en"/.test(smText), "alternates hreflang");
ok(!/&(?!amp;)/.test(smText.replace(/<\?xml[^>]*>/, "")), "XML escapado");

console.log("\n--- llms.txt / IndexNow / otros");
for (const p of ["/llms.txt", "/llms-full.txt"]) {
  const r = await get(p);
  const t = await r.text();
  ok(r.status === 200 && t.startsWith("# GDT DevSur") && t.includes("## Servicios"), `${p}`, `${t.length} bytes`);
}
const robotsKey = await get("/875ba6deb979f77228e93380e729c729.txt");
ok(robotsKey.status === 200 && (await robotsKey.text()).trim() === "875ba6deb979f77228e93380e729c729", "clave IndexNow");
for (const asset of ["/favicon.ico", "/logo-512.png", "/icon-192.png", "/apple-touch-icon.png", "/og-default.jpg"]) {
  const r = await get(asset);
  ok(r.status === 200, asset, r.headers.get("content-type") || "");
}
const nf = await get("/pagina-que-no-existe-xyz");
ok(nf.status === 404, "404 real en rutas inexistentes", String(nf.status));
const slash = await get("/acerca-de/");
ok(slash.status === 301 && /\/acerca-de$/.test(slash.headers.get("location") || ""), "301 /acerca-de/ → /acerca-de");
const admin = await get("/admin");
const adminHtml = await admin.text();
ok(/noindex/.test(admin.headers.get("x-robots-tag") || "") || /name="robots" content="noindex/.test(adminHtml), "/admin noindex");

console.log(failures ? `\n✗ ${failures} problema(s)` : "\n✓ Todo OK");
process.exit(failures ? 1 : 0);
