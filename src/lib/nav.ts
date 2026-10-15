export type NavItem = { label: string; href: string };

/** Hash / ruta de nav → id de colección CMS */
const NAV_MODULE_MAP: Record<string, string> = {
  inicio: "hero",
  nosotros: "about",
  portfolio: "portfolio",
  clientes: "clients",
  servicios: "services",
  blog: "blog",
  faq: "faq",
  contacto: "contact",
  proceso: "process",
  actualidad: "news",
  enfoque: "differentials",
};

type ModuleFlags = Record<string, { enabled?: boolean } | undefined | null>;

/**
 * Oculta del navbar (y footer) los links cuyo módulo está deshabilitado en el CMS.
 */
export function filterNavByModules(nav: NavItem[] | undefined, modules: ModuleFlags): NavItem[] {
  if (!nav?.length) return [];

  return nav.filter((item) => {
    const href = (item.href || "").trim();
    if (!href || href === "#") return true;

    if (/acerca-de/i.test(href)) {
      return modules.about?.enabled !== false;
    }

    const hashIdx = href.indexOf("#");
    if (hashIdx < 0) return true;

    const hash = href.slice(hashIdx + 1).split(/[?&]/)[0]?.toLowerCase() || "";
    if (!hash) return true;

    const moduleId = NAV_MODULE_MAP[hash];
    if (!moduleId) return true;

    return modules[moduleId]?.enabled !== false;
  });
}
