import type { APIRoute } from "astro";
import {
  checkCredentials,
  clearAttempts,
  createSession,
  isRateLimited,
  normalizeEmail,
  registerFailedAttempt,
  sessionCookieHeader,
} from "../../../lib/auth";

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function clientIp(request: Request, fallback: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("x-real-ip")?.trim() || forwarded || fallback;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  let ip = "unknown";
  try {
    ip = clientIp(request, clientAddress);
  } catch {
    ip = clientIp(request, "unknown");
  }
  const keys = [`ip:${ip}`, `email:${normalizeEmail(email)}`];

  if (isRateLimited(keys)) {
    return json({ ok: false, error: "Demasiados intentos. Probá más tarde." }, 429);
  }

  if (!email || !password || !(await checkCredentials(email, password))) {
    registerFailedAttempt(keys);
    return json({ ok: false, error: "Credenciales inválidas" }, 401);
  }

  clearAttempts(keys);
  const token = await createSession();
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookieHeader(token) });
};
