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
  // Arrays: overlay wins entirely (including []). Never resurrect base items.
  if (Array.isArray(overlay)) {
    if (!Array.isArray(base) || overlay.length === 0) return overlay as T;
    const baseArr = base as unknown[];
    const overArr = overlay as unknown[];
    const baseHasIds =
      baseArr.length > 0 &&
      baseArr.every((item) => item && typeof item === "object" && "id" in (item as object));
    const overHasIds =
      overArr.length > 0 &&
      overArr.every((item) => item && typeof item === "object" && "id" in (item as object));
    // Merge by id only when both sides are id-keyed lists; otherwise replace.
    if (baseHasIds && overHasIds) {
      return overArr.map((item) => {
        const id = (item as { id: string }).id;
        const match = baseArr.find(
          (b) => b && typeof b === "object" && (b as { id?: string }).id === id,
        );
        return match ? deepMerge(match, item) : item;
      }) as T;
    }
    return overArr as T;
  }
  if (Array.isArray(base)) return base;
  if (typeof base === "object" && base && typeof overlay === "object" && !Array.isArray(overlay)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [key, value] of Object.entries(overlay as Record<string, unknown>)) {
      // Explicit empty object in overlay means empty (do not keep base keys).
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value as object).length === 0
      ) {
        out[key] = {};
        continue;
      }
      out[key] = key in out ? deepMerge(out[key], value) : value;
    }
    return out as T;
  }
  return overlay as T;
}
