import type { APIRoute } from "astro";
import { localeCookieHeader, normalizeLocale } from "../../lib/locale";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const locale = normalizeLocale(body?.locale);
  return new Response(JSON.stringify({ ok: true, locale }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": localeCookieHeader(locale),
    },
  });
};

/** Evita 502 en el proxy PHP cuando el CDN/monitores hacen HEAD. */
export const HEAD: APIRoute = async () =>
  new Response(null, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
