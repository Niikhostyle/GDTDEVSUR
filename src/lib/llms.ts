import { getCollection } from "./cms";
import { localizedUrl } from "./seo";

const clean = (text: unknown) =>
  String(text ?? "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const visible = (items: any[] = []) => items.filter((i) => i && i.published !== false);

/** Markdown para /llms.txt (resumen) y /llms-full.txt (completo), generado desde el CMS. */
export async function buildLlmsTxt(origin: string, full = false) {
  const [site, hero, about, services, differentials, portfolio, process, faq, blog, news] =
    await Promise.all(
      ["site", "hero", "about", "services", "differentials", "portfolio", "process", "faq", "blog", "news"].map(
        (c) => getCollection<any>(c, "es"),
      ),
    );
  const [siteEn, faqEn, servicesEn] = await Promise.all(
    ["site", "faq", "services"].map((c) => getCollection<any>(c, "en")),
  );

  const brand = clean(site.brandName) || "GDT DevSur";
  const home = localizedUrl(origin, "/", "es");
  const aboutUrl = localizedUrl(origin, "/acerca-de", "es");
  const phones: string[] = site.phones || [];
  const emails: string[] = site.emails || [];
  const social = Object.entries(site.social || {}).filter(
    ([, v]) => typeof v === "string" && /^https?:\/\//.test(v as string),
  ) as [string, string][];
  const definition = clean(faq.items?.[0]?.answer) || clean(site.seo?.description);
  const lines: string[] = [];
  const push = (...l: string[]) => lines.push(...l);

  push(`# ${brand}`, "");
  push(`> ${clean(site.seo?.description)}`, "");
  push(definition, "");
  push(
    `- Nombre: ${brand} (también "GDTDevSur", "gdtdevsur", "DevSur"; Grupo Desarrollo Tecnológico)`,
    `- Tipo: agencia de diseño y desarrollo web`,
    `- País: Chile (trabajo remoto con clientes de todo Chile y el exterior)`,
    `- Sitio web: ${home}`,
    ...emails.map((e) => `- Email: ${e}`),
    ...phones.map((p) => `- Teléfono / WhatsApp: ${p}`),
    ...social.map(([k, v]) => `- ${k[0].toUpperCase()}${k.slice(1)}: ${v}`),
    `- Idiomas: español, inglés`,
    "",
  );

  push("## Servicios", "");
  for (const s of services.items || []) push(`- **${clean(s.title)}**: ${clean(s.description)}`);
  push("");

  push("## Páginas principales", "");
  push(
    `- [Inicio](${home}): ${clean(hero.headline)} ${clean(hero.headlineAccent)} ${clean(hero.subheadline)}`,
    `- [Acerca de ${brand}](${aboutUrl}): ${clean(about.page?.seoDescription)}`,
    `- [Servicios](${home}#servicios)`,
    `- [Portfolio](${home}#portfolio)`,
    `- [Preguntas frecuentes](${home}#faq)`,
    `- [Contacto / presupuesto](${home}#contacto)`,
    `- [English version](${localizedUrl(origin, "/", "en")})`,
    "",
  );

  const projects = (portfolio.items || []).filter((p: any) => p.url);
  if (projects.length) {
    push("## Proyectos destacados", "");
    for (const p of projects) push(`- [${clean(p.title)}](${p.url})${p.category ? ` — ${clean(p.category)}` : ""}`);
    push("");
  }

  push("## Preguntas frecuentes", "");
  for (const item of faq.items || []) push(`### ${clean(item.question)}`, "", clean(item.answer), "");

  if (full) {
    push(`## Sobre ${brand}`, "");
    push(clean(about.body), "");
    for (const h of about.highlights || []) push(`- ${clean(h)}`);
    push("");
    if (about.page?.experienceBody) push(clean(about.page.experienceBody), "");
    for (const p of about.page?.pillars || []) push(`- **${clean(p.title)}**: ${clean(p.body)}`);
    push("");

    push(`## ${clean(differentials.title) || "Diferenciales"}`, "");
    for (const d of differentials.items || []) push(`- **${clean(d.title)}**: ${clean(d.body)}`);
    push("");

    push(`## ${clean(process.title) || "Cómo trabajamos"}`, "");
    (process.steps || []).forEach((s: any, i: number) =>
      push(`${i + 1}. **${clean(s.title)}**: ${clean(s.description)}`),
    );
    push("");
    const stack = (process.stack || []).map((s: any) => clean(s.name)).filter(Boolean);
    if (stack.length) push(`Tecnologías: ${stack.join(", ")}.`, "");

    const posts = visible(blog.items);
    if (posts.length) {
      push("## Artículos", "");
      for (const p of posts) push(`- **${clean(p.title)}**: ${clean(p.excerpt)}`);
      push("");
    }
    const updates = visible(news.items);
    if (updates.length) {
      push("## Novedades", "");
      for (const n of updates) push(`- ${n.date ? `${clean(n.date)} — ` : ""}**${clean(n.title)}**: ${clean(n.body)}`);
      push("");
    }
  }

  push("## English summary", "");
  push(clean(siteEn.seo?.description), "");
  if (faqEn.items?.[0]) push(clean(faqEn.items[0].answer), "");
  push(`Services: ${(servicesEn.items || []).map((s: any) => clean(s.title)).join("; ")}.`, "");
  if (full) {
    for (const item of faqEn.items || []) push(`### ${clean(item.question)}`, "", clean(item.answer), "");
  } else {
    push(`Full version: ${origin}/llms-full.txt`, "");
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function llmsResponse(body: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
