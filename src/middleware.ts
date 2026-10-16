import { defineMiddleware } from "astro:middleware";
import { localeCookieHeader, normalizeLocale } from "./lib/locale";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const method = context.request.method;

  if (
    (method === "GET" || method === "HEAD") &&
    pathname.length > 1 &&
    pathname.endsWith("/") &&
    !pathname.startsWith("/api/")
  ) {
    return new Response(null, {
      status: 301,
      headers: { Location: `${pathname.replace(/\/+$/, "") || "/"}${search}` },
    });
  }

  const lang = context.url.searchParams.get("lang") || context.url.searchParams.get("locale");
  const response = await next();

  if (lang === "en" || lang === "es") {
    const locale = normalizeLocale(lang);
    response.headers.append("Set-Cookie", localeCookieHeader(locale));
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (!response.headers.has("X-Content-Type-Options")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
  }
  if (!response.headers.has("Referrer-Policy")) {
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  // HTML pages must never be long-cached — CMS edits must show on next load.
  const ct = response.headers.get("Content-Type") || "";
  if (
    (method === "GET" || method === "HEAD") &&
    (ct.includes("text/html") || pathname === "/" || pathname.endsWith(".html")) &&
    !pathname.startsWith("/_astro/")
  ) {
    response.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
  }

  return response;
});
