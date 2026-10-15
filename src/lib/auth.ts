import bcrypt from "bcryptjs";
import { parseCookie, stringifySetCookie } from "cookie";
import { getPrisma } from "./db";

export const SESSION_COOKIE = "gds_admin_session";
const TTL_MS = 1000 * 60 * 60 * 24 * 7;
const MIN_SECRET_LENGTH = 16;

/** En producción exige ADMIN_SESSION_SECRET; sin él no hay login (fail closed). */
function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret && secret.length >= MIN_SECRET_LENGTH) return secret;
  if (import.meta.env.PROD) return null;
  return secret || null;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKey() {
  const secret = getSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET no configurado");
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(payload: string) {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toBase64Url(sig)}`;
}

async function verifyPayload(token: string) {
  const i = token.lastIndexOf(".");
  if (i <= 0) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  if (!getSecret()) return null;
  const key = await getKey();
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    fromBase64Url(sig),
    new TextEncoder().encode(payload),
  );
  if (!ok) return null;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;
  return payload;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/** Hash de relleno para que un email inexistente tarde lo mismo que uno válido. */
let dummyHash: string | null = null;
function getDummyHash() {
  dummyHash ??= bcrypt.hashSync(crypto.randomUUID(), 12);
  return dummyHash;
}

/** Valida contra la tabla admin_users (hash bcrypt). Sin base de datos no hay login. */
export async function checkCredentials(email: string, password: string) {
  if (!getSecret()) return false;
  const prisma = getPrisma();
  if (!prisma) return false;
  const normalized = normalizeEmail(email);
  if (!normalized || !password || password.length > 256) return false;
  try {
    const user = await prisma.adminUser.findUnique({ where: { email: normalized } });
    const ok = await bcrypt.compare(password, user?.passwordHash ?? getDummyHash());
    if (!user || !ok) return false;
    await prisma.adminUser
      .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
      .catch(() => {});
    return true;
  } catch (err) {
    console.error("[auth] error consultando admin_users", err);
    return false;
  }
}

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

/** Límite simple en memoria de intentos fallidos por clave (IP / email). */
export function isRateLimited(keys: string[]) {
  const now = Date.now();
  return keys.some((key) => {
    const entry = attempts.get(key);
    return Boolean(entry && entry.resetAt > now && entry.count >= MAX_ATTEMPTS);
  });
}

export function registerFailedAttempt(keys: string[]) {
  const now = Date.now();
  for (const key of keys) {
    const entry = attempts.get(key);
    if (!entry || entry.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    else entry.count++;
  }
  if (attempts.size > 5000) {
    for (const [key, entry] of attempts) if (entry.resetAt <= now) attempts.delete(key);
  }
}

export function clearAttempts(keys: string[]) {
  for (const key of keys) attempts.delete(key);
}

export async function createSession() {
  const expiresAt = Date.now() + TTL_MS;
  return signPayload(String(expiresAt));
}

export async function verifySession(cookieHeader?: string | null) {
  if (!cookieHeader) return false;
  const cookies = parseCookie(cookieHeader);
  const token = cookies[SESSION_COOKIE];
  if (!token) return false;
  return Boolean(await verifyPayload(token));
}

export async function destroySession(_cookieHeader?: string | null) {
  /* cookie firmada: se invalida al borrar la cookie */
}

const secureCookie = import.meta.env.PROD;

export function sessionCookieHeader(token: string) {
  return stringifySetCookie({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: secureCookie,
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

export function clearSessionCookieHeader() {
  return stringifySetCookie({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: secureCookie,
    maxAge: 0,
  });
}
