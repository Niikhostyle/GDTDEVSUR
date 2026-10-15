import type { APIRoute } from "astro";
import { getContentLastModified } from "../lib/cms";
import { localizedUrl, PUBLIC_PAGES as PAGES, siteOrigin } from "../lib/seo";

const SERVER_START = new Date();

export const GET: APIRoute = async ({ site, url }) => {
  const origin = siteOrigin(site, url.origin);
  const cmsModified = await getContentLastModified();
  const lastmod = (cmsModified && cmsModified > SERVER_START ? cmsModified : SERVER_START).toISOString();

  const urls = PAGES.map(({ path, priority, changefreq }) => {
    const locEs = localizedUrl(origin, path, "es");
    const locEn = localizedUrl(origin, path, "en").replace(/&/g, "&amp;");
    const alternates = `    <xhtml:link rel="alternate" hreflang="es-CL" href="${locEs}" />
    <xhtml:link rel="alternate" hreflang="es" href="${locEs}" />
    <xhtml:link rel="alternate" hreflang="en" href="${locEn}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${locEs}" />`;
    return `  <url>
    <loc>${locEs}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
  </url>
  <url>
    <loc>${locEn}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority === "1.0" ? "0.9" : "0.75"}</priority>
${alternates}
  </url>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls.join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
