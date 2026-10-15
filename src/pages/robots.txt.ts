import type { APIRoute } from "astro";
import { siteOrigin } from "../lib/seo";

/** Buscadores y crawlers de IA permitidos explícitamente (cada grupo repite los Disallow). */
const ALLOWED_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Google-Extended",
  "GoogleOther",
  "Bingbot",
  "msnbot",
  "DuckDuckBot",
  "Applebot",
  "Applebot-Extended",
  "YandexBot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Meta-ExternalAgent",
  "Amazonbot",
  "CCBot",
  "cohere-ai",
  "MistralAI-User",
];

const RULES = `Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/`;

export const GET: APIRoute = ({ site, url }) => {
  const origin = siteOrigin(site, url.origin);
  const groups = ALLOWED_BOTS.map((bot) => `User-agent: ${bot}\n${RULES}`).join("\n\n");
  const body = `# GDT DevSur — ${origin}
# Resumen para modelos de lenguaje: ${origin}/llms.txt

User-agent: *
${RULES}

${groups}

Sitemap: ${origin}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
