import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Imágenes de Unsplash (imgix): fuerza WebP y el ancho pedido.
 * Otras URLs se devuelven sin cambios.
 */
export function imageUrl(src: string | undefined, width: number, quality = 70) {
  if (!src || !src.includes("images.unsplash.com")) return src;
  try {
    const url = new URL(src);
    url.searchParams.delete("auto");
    url.searchParams.set("fm", "webp");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality));
    return url.toString();
  } catch {
    return src;
  }
}

/** srcset con varios anchos para imágenes de Unsplash; undefined para el resto. */
export function imageSrcset(src: string | undefined, widths: number[], quality = 70) {
  if (!src || !src.includes("images.unsplash.com")) return undefined;
  return widths.map((w) => `${imageUrl(src, w, quality)} ${w}w`).join(", ");
}
