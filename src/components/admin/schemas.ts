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
        label: "Emails",
        itemLabel: "Email",
        fields: [{ key: "value", label: "Email", type: "text" }],
        create: () => ({ value: "" }),
      },
    ],
  },
  hero: {
    id: "hero",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headline", label: "Titular", type: "text" },
      { key: "headlineAccent", label: "Titular acento", type: "text" },
      { key: "subheadline", label: "Subtítulo", type: "textarea" },
      { key: "trustLabel", label: "Texto de confianza", type: "text" },
      { key: "backgroundImage", label: "Imagen de fondo", type: "url" },
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
    lists: [
      {
        key: "stats",
        label: "Estadísticas",
        itemLabel: "Stat",
        fields: [
          { key: "value", label: "Valor", type: "text" },
          { key: "label", label: "Etiqueta", type: "text" },
        ],
        create: () => ({ value: "0", label: "Nuevo dato" }),
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
      { key: "image", label: "Imagen", type: "url" },
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
        label: "Highlights",
        itemLabel: "Highlight",
        fields: [{ key: "value", label: "Texto", type: "text" }],
        create: () => ({ value: "Nuevo highlight" }),
      },
    ],
  },
  services: {
    id: "services",
    hasEnabled: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "textarea" },
    ],
    lists: [
      {
        key: "items",
        label: "Servicios",
        itemLabel: "Servicio",
        fields: [
          { key: "title", label: "Título", type: "text" },
          { key: "description", label: "Descripción", type: "textarea" },
          { key: "icon", label: "Icono (id)", type: "text" },
        ],
        create: () => ({
          id: slugId("svc"),
          title: "Nuevo servicio",
          description: "",
          icon: "sparkles",
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
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "textarea" },
      { key: "stackEyebrow", label: "Eyebrow stack", type: "text" },
      { key: "stackTitle", label: "Título stack", type: "text" },
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
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "textarea" },
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
      { key: "title", label: "Título", type: "text" },
      { key: "subtitle", label: "Subtítulo", type: "textarea" },
      { key: "successMessage", label: "Mensaje de éxito", type: "text" },
      { key: "submitLabel", label: "Texto del botón", type: "text" },
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

/** Normaliza arrays de strings (phones/emails/highlights) a objetos {value} para el editor */
export function toEditorModel(id: CollectionId, data: Record<string, unknown>) {
  const next = structuredClone(data);
  if (id === "site") {
    next.phones = ((data.phones as string[]) || []).map((value) => ({ value }));
    next.emails = ((data.emails as string[]) || []).map((value) => ({ value }));
  }
  if (id === "about") {
    next.highlights = ((data.highlights as string[]) || []).map((value) => ({ value }));
  }
  return next;
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
  return next;
}
