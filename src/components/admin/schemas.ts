import type { CollectionId } from "../../lib/collections";

export type FieldType = "text" | "textarea" | "url" | "boolean" | "number";

export type FieldDef = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
};

export type ListDef = {
  key: string;
  label: string;
  itemLabel: string;
  fields: FieldDef[];
  create: () => Record<string, unknown>;
};

export type CollectionSchema = {
  id: CollectionId;
  hasEnabled?: boolean;
  fields: FieldDef[];
  objects?: { key: string; label: string; fields: FieldDef[] }[];
  lists?: ListDef[];
};

function slugId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export const SCHEMAS: Record<CollectionId, CollectionSchema> = {
  site: {
    id: "site",
    fields: [
      { key: "brandName", label: "Nombre de marca", type: "text" },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "logoText", label: "Texto logo", type: "text" },
      { key: "primaryColor", label: "Color primario", type: "text" },
      { key: "footerNote", label: "Nota footer", type: "text" },
      { key: "footerBlurb", label: "Texto bajo el logo (footer)", type: "textarea" },
      { key: "footerMapLabel", label: "Label columna mapa (footer)", type: "text" },
      { key: "footerContactLabel", label: "Label columna contacto (footer)", type: "text" },
      {
        key: "whatsappPrefill",
        label: "Texto precargado WhatsApp (header)",
        type: "text",
      },
    ],
    objects: [
      {
        key: "seo",
        label: "SEO",
        fields: [
          { key: "title", label: "Título SEO", type: "text" },
          { key: "description", label: "Descripción SEO", type: "textarea" },
          { key: "ogImage", label: "Imagen OG", type: "url" },
          {
            key: "googleSiteVerification",
            label: "Google Search Console (código google-site-verification)",
            type: "text",
            placeholder: "Pega el código o la etiqueta <meta> completa",
          },
          {
            key: "bingSiteVerification",
            label: "Bing Webmaster Tools (código msvalidate.01)",
            type: "text",
            placeholder: "Pega el código o la etiqueta <meta> completa",
          },
        ],
      },
      {
        key: "social",
        label: "Redes sociales (perfiles oficiales, se usan en Google/IA)",
        fields: [
          { key: "instagram", label: "Instagram", type: "url" },
          { key: "linkedin", label: "LinkedIn", type: "url" },
          { key: "facebook", label: "Facebook", type: "url" },
          { key: "x", label: "X / Twitter", type: "url" },
          { key: "youtube", label: "YouTube", type: "url" },
          { key: "tiktok", label: "TikTok", type: "url" },
          { key: "github", label: "GitHub", type: "url" },
          { key: "googleBusiness", label: "Perfil de Google Business", type: "url" },
        ],
      },
      {
        key: "ctaPrimary",
        label: "CTA principal",
        fields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "href", label: "Enlace", type: "text" },
        ],
      },
      {
        key: "ctaSecondary",
        label: "CTA secundario",
        fields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "href", label: "Enlace", type: "text" },
        ],
      },
    ],
    lists: [
      {
        key: "nav",
        label: "Navegación",
        itemLabel: "Link",
        fields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "href", label: "Enlace", type: "text" },
        ],
        create: () => ({ label: "Nuevo link", href: "#" }),
      },
      {
        key: "phones",
        label: "Teléfonos",
        itemLabel: "Teléfono",
        fields: [{ key: "value", label: "Número", type: "text" }],
        create: () => ({ value: "" }),
      },
      {
        key: "emails",
        label: "Emails del sitio (footer + SEO; respaldo si Contacto no tiene email)",
        itemLabel: "Email",
        fields: [{ key: "value", label: "Dirección de email", type: "text" }],
        create: () => ({ value: "" }),
      },
      {
        key: "marquee",
        label: "Cinta animada (home)",
        itemLabel: "Ítem",
        fields: [{ key: "value", label: "Texto", type: "text" }],
        create: () => ({ value: "" }),
      },
    ],
  },
  hero: {
    id: "hero",
    hasEnabled: true,
    fields: [
      { key: "brandTitle", label: "Marca grande (hero H1)", type: "text" },
      { key: "metaLine", label: "Línea meta bajo CTAs", type: "text" },
      { key: "headline", label: "Titular (parte light)", type: "text" },
      { key: "headlineBold", label: "Titular negrita (ej. convierten)", type: "text" },
      { key: "headlineRest", label: "Titular resto (ej. visitas en)", type: "text" },
      { key: "headlineAccent", label: "Titular acento / degradado (ej. clientes.)", type: "text" },
      { key: "subheadline", label: "Párrafo de apoyo", type: "textarea" },
    ],
    objects: [
      {
        key: "primaryCta",
        label: "CTA primario",
        fields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "href", label: "Enlace", type: "text" },
        ],
      },
      {
        key: "secondaryCta",
        label: "CTA secundario",
        fields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "href", label: "Enlace", type: "text" },
        ],
      },
    ],
  },
  about: {
    id: "about",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Título", type: "text" },
      { key: "body", label: "Texto (usa **negrita**)", type: "textarea" },
    ],
    objects: [
      {
        key: "cta",
        label: "CTA",
        fields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "href", label: "Enlace", type: "text" },
        ],
      },
    ],
    lists: [
      {
        key: "highlights",
        label: "Bullets / highlights",
        itemLabel: "Punto",
        fields: [{ key: "value", label: "Texto", type: "text" }],
        create: () => ({ value: "Nuevo punto" }),
      },
    ],
  },
  services: {
    id: "services",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow (Qué hacemos)", type: "text" },
      { key: "titleLight", label: "Titular light", type: "text" },
      { key: "titleBold", label: "Titular bold", type: "text" },
      { key: "title", label: "Título completo (SEO)", type: "text" },
      { key: "subtitle", label: "Lead / subtítulo", type: "textarea" },
      { key: "detailEyebrow", label: "Detalle · Eyebrow (Servicios)", type: "text" },
      { key: "detailTitleLight", label: "Detalle · Titular light", type: "text" },
      { key: "detailTitleBold", label: "Detalle · Titular bold", type: "text" },
      { key: "detailSubtitle", label: "Detalle · Lead", type: "textarea" },
    ],
    lists: [
      {
        key: "items",
        label: "Grid Qué hacemos",
        itemLabel: "Celda",
        fields: [
          { key: "id", label: "ID / ancla", type: "text" },
          { key: "title", label: "Título", type: "text" },
          { key: "description", label: "Descripción corta", type: "textarea" },
          { key: "href", label: "Enlace", type: "text" },
        ],
        create: () => ({
          id: slugId("svc"),
          title: "Nuevo servicio",
          description: "",
          href: "#contacto",
        }),
      },
      {
        key: "detailItems",
        label: "Bloques detalle Servicios",
        itemLabel: "Servicio",
        fields: [
          { key: "id", label: "ID / ancla", type: "text" },
          { key: "label", label: "Label (01 — …)", type: "text" },
          { key: "title", label: "Título", type: "text" },
          { key: "body", label: "Párrafo", type: "textarea" },
          { key: "note", label: "Nota (**negrita** ok)", type: "textarea" },
          { key: "ctaLabel", label: "Texto CTA", type: "text" },
          { key: "href", label: "Enlace CTA", type: "text" },
        ],
        create: () => ({
          id: slugId("svc-d"),
          label: "01 — Nuevo",
          title: "Nuevo servicio",
          body: "",
          note: "",
          ctaLabel: "Conocer →",
          href: "#contacto",
        }),
      },
    ],
  },
  why: {
    id: "why",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "titleLight", label: "Titular light", type: "text" },
      { key: "titleBold", label: "Titular bold", type: "text" },
      { key: "body", label: "Párrafo", type: "textarea" },
    ],
    lists: [
      {
        key: "items",
        label: "Checklist",
        itemLabel: "Punto",
        fields: [{ key: "value", label: "Texto", type: "text" }],
        create: () => ({ value: "Nuevo punto" }),
      },
      {
        key: "stats",
        label: "Estadísticas (franja inferior)",
        itemLabel: "Stat",
        fields: [
          { key: "value", label: "Valor numérico (vacío si usas texto fijo)", type: "number" },
          { key: "prefix", label: "Prefijo (ej. +)", type: "text" },
          { key: "text", label: "Texto fijo (ej. CL; tiene prioridad sobre número)", type: "text" },
          { key: "label", label: "Etiqueta / leyenda", type: "text" },
          {
            key: "invert",
            label: "Destacado (tarjeta blanca inclinada)",
            type: "boolean",
          },
        ],
        create: () => ({
          value: 0,
          prefix: "+",
          text: "",
          label: "Nuevo dato",
          invert: false,
        }),
      },
    ],
  },
  differentials: {
    id: "differentials",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "textarea" },
    ],
    lists: [
      {
        key: "items",
        label: "Diferenciales",
        itemLabel: "Ítem",
        fields: [
          { key: "title", label: "Título", type: "text" },
          { key: "body", label: "Texto", type: "textarea" },
          { key: "icon", label: "Icono (id)", type: "text" },
        ],
        create: () => ({
          id: slugId("diff"),
          title: "Nuevo diferencial",
          body: "",
          icon: "tech",
        }),
      },
    ],
  },
  portfolio: {
    id: "portfolio",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "textarea" },
    ],
    objects: [
      {
        key: "cta",
        label: "CTA",
        fields: [
          { key: "label", label: "Texto", type: "text" },
          { key: "href", label: "Enlace", type: "text" },
        ],
      },
    ],
    lists: [
      {
        key: "items",
        label: "Proyectos",
        itemLabel: "Proyecto",
        fields: [
          { key: "title", label: "Título", type: "text" },
          { key: "client", label: "Cliente", type: "text" },
          { key: "category", label: "Categoría", type: "text" },
          { key: "image", label: "Imagen", type: "url" },
          { key: "url", label: "URL del proyecto", type: "url" },
          { key: "featured", label: "Destacado", type: "boolean" },
        ],
        create: () => ({
          id: slugId("p"),
          title: "Nuevo proyecto",
          client: "",
          category: "Diseño web",
          image: "",
          url: "#",
          featured: true,
        }),
      },
    ],
  },
  process: {
    id: "process",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "titleLight", label: "Titular light", type: "text" },
      { key: "titleBold", label: "Titular bold", type: "text" },
      { key: "title", label: "Título completo", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "textarea" },
      { key: "stackTitle", label: "Título stack (Con qué construimos)", type: "text" },
    ],
    lists: [
      {
        key: "steps",
        label: "Pasos",
        itemLabel: "Paso",
        fields: [
          { key: "number", label: "Número", type: "text" },
          { key: "title", label: "Título", type: "text" },
          { key: "description", label: "Descripción", type: "textarea" },
        ],
        create: () => ({
          number: "0",
          title: "Nuevo paso",
          description: "",
        }),
      },
      {
        key: "stack",
        label: "Stack tecnológico",
        itemLabel: "Tecnología",
        fields: [
          { key: "name", label: "Nombre (ej. NGINX, Laravel)", type: "text" },
          {
            key: "icon",
            label: "Icono (auto desde nombre; ej. nginx)",
            type: "text",
            placeholder: "nginx",
          },
          {
            key: "logo",
            label: "Logo URL (auto; o pega una URL propia)",
            type: "url",
            placeholder: "/tech/nginx.svg",
          },
        ],
        create: () => ({
          id: slugId("tech"),
          name: "",
          icon: "",
          logo: "",
        }),
      },
    ],
  },
  clients: {
    id: "clients",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Título", type: "text" },
    ],
    lists: [
      {
        key: "items",
        label: "Clientes",
        itemLabel: "Cliente",
        fields: [
          { key: "name", label: "Nombre", type: "text" },
          { key: "url", label: "URL", type: "url" },
          { key: "logo", label: "Logo (URL)", type: "url" },
        ],
        create: () => ({
          id: slugId("c"),
          name: "nuevo-cliente.com",
          url: "",
          logo: "",
        }),
      },
    ],
  },
  blog: {
    id: "blog",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Título", type: "text" },
    ],
    lists: [
      {
        key: "items",
        label: "Artículos",
        itemLabel: "Artículo",
        fields: [
          { key: "title", label: "Título", type: "text" },
          { key: "excerpt", label: "Extracto", type: "textarea" },
          { key: "date", label: "Fecha (YYYY-MM-DD)", type: "text" },
          { key: "slug", label: "Slug", type: "text" },
          { key: "image", label: "Imagen", type: "url" },
          { key: "published", label: "Publicado", type: "boolean" },
        ],
        create: () => ({
          id: slugId("b"),
          title: "Nuevo artículo",
          excerpt: "",
          date: new Date().toISOString().slice(0, 10),
          slug: "nuevo-articulo",
          image: "",
          published: true,
        }),
      },
    ],
  },
  faq: {
    id: "faq",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "titleOutline", label: "Título outline", type: "text" },
      { key: "titleSolid", label: "Título sólido", type: "text" },
      { key: "title", label: "Título completo", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "textarea" },
      { key: "ctaLabel", label: "Texto CTA", type: "text" },
      { key: "ctaHref", label: "Enlace CTA", type: "text" },
    ],
    lists: [
      {
        key: "items",
        label: "Preguntas",
        itemLabel: "FAQ",
        fields: [
          { key: "question", label: "Pregunta", type: "text" },
          { key: "answer", label: "Respuesta", type: "textarea" },
        ],
        create: () => ({
          id: slugId("f"),
          question: "Nueva pregunta",
          answer: "",
        }),
      },
    ],
  },
  contact: {
    id: "contact",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "titleLight", label: "Titular light", type: "text" },
      { key: "titleBold", label: "Titular bold", type: "text" },
      { key: "title", label: "Título completo", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "textarea" },
      { key: "location", label: "Ubicación", type: "text" },
      { key: "locationLabel", label: "Etiqueta de la columna Ubicación (ej. Ubicación)", type: "text" },
      {
        key: "email",
        label: "Email de contacto (dirección mostrada en la landing)",
        type: "text",
      },
      {
        key: "emailLabel",
        label: "Etiqueta de la columna Correo (texto, ej. Correo — NO el email)",
        type: "text",
      },
      { key: "whatsappLabel", label: "Etiqueta de la columna WhatsApp", type: "text" },
      { key: "serviceLabel", label: "Etiqueta del campo Servicio", type: "text" },
      { key: "budgetLabel", label: "Etiqueta del campo Presupuesto", type: "text" },
      { key: "whatsappHint", label: "Nota bajo el botón", type: "text" },
      { key: "successMessage", label: "Mensaje de éxito", type: "text" },
      { key: "submitLabel", label: "Texto del botón", type: "text" },
    ],
    objects: [
      {
        key: "fields",
        label: "Etiquetas del formulario",
        fields: [
          { key: "nameLabel", label: "Etiqueta campo Nombre", type: "text" },
          { key: "companyLabel", label: "Etiqueta campo Empresa", type: "text" },
          { key: "emailLabel", label: "Etiqueta campo Email del formulario", type: "text" },
          { key: "phoneLabel", label: "Etiqueta campo Teléfono", type: "text" },
          { key: "messageLabel", label: "Etiqueta campo Proyecto", type: "text" },
        ],
      },
    ],
    lists: [
      {
        key: "serviceOptions",
        label: "Opciones de servicio (select)",
        itemLabel: "Opción",
        fields: [
          { key: "value", label: "Valor", type: "text" },
          { key: "label", label: "Etiqueta", type: "text" },
        ],
        create: () => ({ value: "", label: "Nueva opción" }),
      },
      {
        key: "budgetOptions",
        label: "Opciones de presupuesto (select)",
        itemLabel: "Opción",
        fields: [
          { key: "value", label: "Valor", type: "text" },
          { key: "label", label: "Etiqueta", type: "text" },
        ],
        create: () => ({ value: "", label: "Nueva opción" }),
      },
    ],
  },
  news: {
    id: "news",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Título", type: "text" },
    ],
    lists: [
      {
        key: "items",
        label: "Noticias",
        itemLabel: "Noticia",
        fields: [
          { key: "date", label: "Fecha (YYYY-MM-DD)", type: "text" },
          { key: "title", label: "Título", type: "text" },
          { key: "body", label: "Texto", type: "textarea" },
          { key: "published", label: "Publicado", type: "boolean" },
        ],
        create: () => ({
          id: slugId("n"),
          date: new Date().toISOString().slice(0, 10),
          title: "Nueva noticia",
          body: "",
          published: true,
        }),
      },
    ],
  },
};

/** Normaliza datos CMS → modelo editable en el panel */
export function toEditorModel(id: CollectionId, data: Record<string, unknown>) {
  const next = structuredClone(data);
  if (id === "site") {
    next.phones = ((data.phones as string[]) || []).map((value) => ({ value }));
    next.emails = ((data.emails as string[]) || []).map((value) => ({ value }));
  }
  if (id === "about") {
    next.highlights = ((data.highlights as string[]) || []).map((value) => ({ value }));
  }
  if (id === "why") {
    const items = data.items;
    next.items = Array.isArray(items)
      ? items.map((v) => (typeof v === "string" ? { value: v } : v))
      : [];
  }
  if (id === "services") {
    const detail = (data.detail as Record<string, unknown>) || {};
    next.detailEyebrow = detail.eyebrow ?? "";
    next.detailTitleLight = detail.titleLight ?? "";
    next.detailTitleBold = detail.titleBold ?? "";
    next.detailSubtitle = detail.subtitle ?? "";
    next.detailItems = Array.isArray(detail.items) ? detail.items : [];
  }
  if (id === "contact") {
    const fields = (data.fields as Record<string, { label?: string; required?: boolean }>) || {};
    next.fields = {
      nameLabel: fields.name?.label ?? "Nombre",
      companyLabel: fields.company?.label ?? "Empresa",
      emailLabel: fields.email?.label ?? "Correo electrónico",
      phoneLabel: fields.phone?.label ?? "Teléfono / WhatsApp",
      messageLabel: fields.message?.label ?? "Proyecto",
    };
    // Si alguien pegó un email en la etiqueta de columna, muévelo al campo real.
    const label = String(next.emailLabel ?? "");
    const contactEmail = String(next.email ?? "").trim();
    if (!contactEmail && looksLikeEmail(label)) {
      next.email = label.trim();
      next.emailLabel = "Correo";
    }
  }
  return next;
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Vuelve del modelo editor al JSON real de la web */
export function fromEditorModel(id: CollectionId, data: Record<string, unknown>) {
  const next = structuredClone(data);
  if (id === "site") {
    next.phones = ((data.phones as { value: string }[]) || []).map((i) => i.value).filter(Boolean);
    next.emails = ((data.emails as { value: string }[]) || []).map((i) => i.value).filter(Boolean);
  }
  if (id === "about") {
    next.highlights = ((data.highlights as { value: string }[]) || [])
      .map((i) => i.value)
      .filter(Boolean);
  }
  if (id === "why") {
    next.items = ((data.items as { value: string }[]) || []).map((i) => i.value).filter(Boolean);
  }
  if (id === "services") {
    next.detail = {
      eyebrow: data.detailEyebrow ?? "",
      titleLight: data.detailTitleLight ?? "",
      titleBold: data.detailTitleBold ?? "",
      subtitle: data.detailSubtitle ?? "",
      items: Array.isArray(data.detailItems) ? data.detailItems : [],
    };
    delete next.detailEyebrow;
    delete next.detailTitleLight;
    delete next.detailTitleBold;
    delete next.detailSubtitle;
    delete next.detailItems;
  }
  if (id === "contact") {
    const flat = (data.fields as Record<string, string>) || {};
    const prev = (data as { _fieldsRaw?: Record<string, { label: string; required: boolean }> })._fieldsRaw;
    next.fields = {
      name: { label: flat.nameLabel || "Nombre", required: true },
      company: { label: flat.companyLabel || "Empresa", required: false },
      email: { label: flat.emailLabel || "Correo electrónico", required: true },
      phone: { label: flat.phoneLabel || "Teléfono / WhatsApp", required: true },
      message: { label: flat.messageLabel || "Proyecto", required: true },
    };
    const label = String(next.emailLabel ?? "");
    const contactEmail = String(next.email ?? "").trim();
    if (!contactEmail && looksLikeEmail(label)) {
      next.email = label.trim();
      next.emailLabel = "Correo";
    } else if (typeof next.email === "string") {
      next.email = next.email.trim();
    }
    void prev;
  }
  return next;
}
