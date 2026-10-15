import { parseCookie, stringifySetCookie } from "cookie";

export const LOCALE_COOKIE = "gds_locale";
export type Locale = "es" | "en";

export function normalizeLocale(value?: string | null): Locale {
  return value === "en" ? "en" : "es";
}

export function getLocaleFromRequest(request: Request): Locale {
  try {
    const url = new URL(request.url);
    const fromQuery = url.searchParams.get("lang") || url.searchParams.get("locale");
    if (fromQuery === "en" || fromQuery === "es") return fromQuery;
  } catch {
    /* ignore */
  }

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return "es";
  const cookies = parseCookie(cookieHeader);
  return normalizeLocale(cookies[LOCALE_COOKIE]);
}

export function localeCookieHeader(locale: Locale) {
  return stringifySetCookie({
    name: LOCALE_COOKIE,
    value: locale,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export function deepMerge<T>(base: T, overlay: unknown): T {
  if (overlay === null || overlay === undefined) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(overlay)) return base;
    const baseArr = base as unknown[];
    const overArr = overlay as unknown[];
    const baseHasIds = baseArr.every(
      (item) => item && typeof item === "object" && "id" in (item as object),
    );
    if (baseHasIds) {
      return baseArr.map((item) => {
        const id = (item as { id: string }).id;
        const match = overArr.find(
          (o) => o && typeof o === "object" && (o as { id?: string }).id === id,
        );
        return match ? deepMerge(item, match) : item;
      }) as T;
    }
    return (overArr.length ? overArr : baseArr) as T;
  }
  if (typeof base === "object" && base && typeof overlay === "object" && !Array.isArray(overlay)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(overlay as Record<string, unknown>)) {
      out[key] = key in out ? deepMerge(out[key], value) : value;
    }
    return out as T;
  }
  return overlay as T;
}
