import type { Locale } from "./locale";

const DEFAULT_KEYWORDS_ES = [
  "diseño web Chile",
  "agencia diseño web premium",
  "desarrollo web a medida",
  "Astro Next.js",
  "SEO técnico Chile",
  "GEO inteligencia artificial",
  "sitios autoadministrables",
  "landing pages premium",
  "rediseño web corporativo",
];

const DEFAULT_KEYWORDS_EN = [
  "web design Chile",
  "premium web design agency",
  "custom web development",
  "Astro Next.js",
  "technical SEO Chile",
  "GEO generative engine optimization",
  "self-manageable websites",
  "premium landing pages",
  "corporate website redesign",
];

/** Páginas públicas indexables (sitemap, llms.txt, IndexNow). */
export const PUBLIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/acerca-de", priority: "0.85", changefreq: "monthly" },
];

export const BRAND_ALTERNATE_NAMES = [
  "GDT DevSur",
  "GDTDevSur",
  "gdtdevsur",
  "DevSur",
  "Grupo Desarrollo Tecnológico",
  "Grupo Desarrollo Tecnológico DevSur",
];

export function siteOrigin(site?: URL | string | null, fallbackOrigin?: string) {
  const raw = (typeof site === "string" ? site : site?.toString()) || fallbackOrigin || "";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(origin: string, pathOrUrl: string) {
  if (!pathOrUrl) return origin;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/** Imágenes locales .webp con copia .jpg para redes sociales (compatibilidad). */
const SHARE_JPG_FALLBACKS: Record<string, string> = {
  "/og-default.webp": "/og-default.jpg",
};

export const DEFAULT_SHARE_IMAGE = "/og-default.jpg";

export function shareImagePath(pathOrUrl: string) {
  if (!pathOrUrl) return DEFAULT_SHARE_IMAGE;
  for (const [webp, jpg] of Object.entries(SHARE_JPG_FALLBACKS)) {
    if (pathOrUrl === webp || pathOrUrl.endsWith(webp)) {
      return pathOrUrl.slice(0, -webp.length) + jpg;
    }
  }
  return pathOrUrl;
}

export function imageMimeType(pathOrUrl: string) {
  const ext = pathOrUrl.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

export function canonicalPath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/$/, "") || "/";
}

/** Clean canonical without lang query (ES default). EN alternate uses ?lang=en */
export function localizedUrl(origin: string, pathname: string, locale: Locale) {
  const path = canonicalPath(pathname);
  const base = path === "/" ? `${origin}/` : `${origin}${path}`;
  if (locale === "en") return `${base}${base.includes("?") ? "&" : "?"}lang=en`;
  return base;
}

export function defaultKeywords(locale: Locale) {
  return locale === "en" ? DEFAULT_KEYWORDS_EN : DEFAULT_KEYWORDS_ES;
}

export function truncateMeta(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}
