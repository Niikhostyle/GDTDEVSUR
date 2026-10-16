export const COLLECTIONS = [
  { id: "site", label: "Sitio y navegación" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "Acerca de" },
  { id: "services", label: "Servicios" },
  { id: "why", label: "Por qué una web" },
  { id: "differentials", label: "Diferenciales" },
  { id: "portfolio", label: "Portfolio" },
  { id: "process", label: "Proceso" },
  { id: "clients", label: "Clientes" },
  { id: "blog", label: "Blog" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contacto" },
  { id: "news", label: "Actualidad" },
] as const;

export type CollectionId = (typeof COLLECTIONS)[number]["id"];
