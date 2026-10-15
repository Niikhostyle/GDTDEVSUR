/** Validación y endurecimiento del formulario de contacto (cliente + servidor). */

const PHONE_RE = /^\+?[0-9]{8,15}$/;

/** Patrones típicos de XSS / inyección en mensajes. */
const DANGEROUS_RE =
  /<\s*script\b|<\s*iframe\b|<\s*object\b|<\s*embed\b|<\s*svg\b|<\s*img\b|<\s*link\b|<\s*meta\b|<\s*style\b|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html|on\w+\s*=|expression\s*\(|<\s*\/\s*script|&#x?0*6[5-9a-f]|\\u003c|\\x3c/i;

export function normalizePhone(raw: string) {
  const trimmed = String(raw || "").trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function isValidPhone(raw: string) {
  return PHONE_RE.test(normalizePhone(raw));
}

/** Solo dígitos (y + inicial) mientras el usuario escribe. */
export function filterPhoneInput(raw: string) {
  const hasPlus = String(raw || "").trimStart().startsWith("+");
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 15);
  return hasPlus ? `+${digits}` : digits;
}

export function stripHtml(raw: string) {
  return String(raw || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsDangerousContent(raw: string) {
  const value = String(raw || "");
  if (DANGEROUS_RE.test(value)) return true;
  // Tras “decodificar” entidades básicas, volver a chequear
  const decoded = value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  return DANGEROUS_RE.test(decoded);
}

export function sanitizeMessage(raw: string) {
  if (containsDangerousContent(raw)) {
    return { ok: false as const, error: "El mensaje contiene contenido no permitido" };
  }
  const cleaned = stripHtml(raw).slice(0, 5000);
  if (!cleaned) {
    return { ok: false as const, error: "El mensaje no es válido" };
  }
  // Rechazar si tras limpiar HTML quedó vacío pero el original tenía tags
  if (!cleaned && /<[^>]+>/.test(String(raw))) {
    return { ok: false as const, error: "El mensaje contiene contenido no permitido" };
  }
  return { ok: true as const, value: cleaned };
}

export function sanitizeName(raw: string) {
  return stripHtml(raw).slice(0, 120);
}

export function sanitizeCompany(raw: string) {
  return stripHtml(raw).slice(0, 160);
}

export function isValidEmail(raw: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(raw || "").trim());
}

/** Normaliza un ID de GA4 (G-XXXXXXXX) o UA legacy. */
export function normalizeGaId(raw: string) {
  const v = String(raw || "").trim();
  const m = v.match(/\b(G-[A-Z0-9]+|UA-\d+-\d+)\b/i);
  return m ? m[1].toUpperCase().replace("UA-", "UA-") : "";
}
