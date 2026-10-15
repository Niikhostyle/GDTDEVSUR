/** Mapa nombre → slug de icono (archivos en /public/tech o CDN Simple Icons) */
const ALIASES: Record<string, string> = {
  react: "react",
  node: "nodedotjs",
  nodejs: "nodedotjs",
  "node.js": "nodedotjs",
  next: "nextdotjs",
  nextjs: "nextdotjs",
  "next.js": "nextdotjs",
  tailwind: "tailwindcss",
  "tailwind css": "tailwindcss",
  tailwindcss: "tailwindcss",
  payload: "payloadcms",
  "payload cms": "payloadcms",
  prisma: "prisma",
  astro: "astro",
  gsap: "greensock",
  greensock: "greensock",
  ts: "typescript",
  typescript: "typescript",
  vite: "vite",
  lenis: "lenis",
  nginx: "nginx",
  laravel: "laravel",
  cloudflare: "cloudflare",
  php: "php",
  mysql: "mysql",
  postgresql: "postgresql",
  postgres: "postgresql",
  docker: "docker",
  vercel: "vercel",
  aws: "amazonwebservices",
  "amazon web services": "amazonwebservices",
  amazonwebservices: "amazonwebservices",
  amazonaws: "amazonwebservices",
  redis: "redis",
  mongodb: "mongodb",
  graphql: "graphql",
  wordpress: "wordpress",
  shopify: "shopify",
  figma: "figma",
  sharp: "sharp",
  html: "html5",
  html5: "html5",
  css: "css",
  css3: "css",
  javascript: "javascript",
  js: "javascript",
  python: "python",
  django: "django",
  fastapi: "fastapi",
  go: "go",
  rust: "rust",
  svelte: "svelte",
  vue: "vuedotjs",
  "vue.js": "vuedotjs",
  angular: "angular",
  bun: "bun",
  deno: "deno",
  supabase: "supabase",
  firebase: "firebase",
  stripe: "stripe",
  git: "git",
  github: "github",
  gitlab: "gitlab",
};

/** Slugs con SVG local en /public/tech (evita 404 del CDN) */
const LOCAL_SLUGS = new Set([
  "react",
  "nodedotjs",
  "nextdotjs",
  "tailwindcss",
  "payloadcms",
  "prisma",
  "astro",
  "greensock",
  "typescript",
  "vite",
  "lenis",
  "nginx",
  "laravel",
  "cloudflare",
  "php",
  "mysql",
  "docker",
  "vercel",
  "amazonwebservices",
  "redis",
  "mongodb",
  "wordpress",
  "shopify",
  "figma",
  "html5",
  "css",
  "javascript",
  "python",
  "vuedotjs",
  "angular",
  "supabase",
  "firebase",
  "stripe",
  "git",
  "github",
]);

export function normalizeTechKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.+]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function lookupTechSlug(value?: string | null): string | null {
  if (!value) return null;
  const key = normalizeTechKey(value);
  if (!key || key.startsWith("tech ")) return null;
  if (ALIASES[key]) return ALIASES[key];
  const compact = key.replace(/[.\s]/g, "");
  if (ALIASES[compact]) return ALIASES[compact];
  return null;
}

/** URL local preferida; CDN como respaldo */
export function techIconUrl(slug: string) {
  if (LOCAL_SLUGS.has(slug)) return `/tech/${slug}.svg`;
  return `https://cdn.simpleicons.org/${slug}`;
}

export function simpleIconsUrl(slug: string) {
  return techIconUrl(slug);
}

/** Resuelve icono a partir de id/name/label/logo/icon */
export function resolveTechIconSlug(input: {
  id?: string;
  name?: string;
  label?: string;
  logo?: string;
  icon?: string;
}) {
  if (input.logo?.startsWith("http") || input.logo?.startsWith("/")) {
    return { kind: "url" as const, value: input.logo };
  }
  if (input.icon?.startsWith("http") || input.icon?.startsWith("/")) {
    return { kind: "url" as const, value: input.icon };
  }

  const candidates = [input.icon, input.logo, input.name, input.label, input.id].filter(Boolean);

  for (const raw of candidates) {
    const slug = lookupTechSlug(String(raw));
    if (slug) return { kind: "simple" as const, value: slug };
  }

  return null;
}

/** Al guardar stack: rellena icon + logo desde el nombre si faltan */
export function enrichStackItem<T extends Record<string, unknown>>(item: T): T {
  const name = String(item.name || item.label || "").trim();
  const id = String(item.id || "").trim();
  const hasLogo =
    typeof item.logo === "string" &&
    (item.logo.startsWith("http") || item.logo.startsWith("/"));
  if (hasLogo) return item;

  const slug =
    lookupTechSlug(String(item.icon || "")) ||
    lookupTechSlug(name) ||
    lookupTechSlug(id);

  if (!slug) return item;

  return {
    ...item,
    icon: slug,
    logo: techIconUrl(slug),
  };
}

export function enrichProcessStack(data: Record<string, unknown>) {
  if (!Array.isArray(data.stack)) return data;
  return {
    ...data,
    stack: data.stack.map((item) =>
      item && typeof item === "object"
        ? enrichStackItem(item as Record<string, unknown>)
        : item,
    ),
  };
}
