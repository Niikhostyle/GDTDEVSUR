import type { APIRoute } from "astro";
import { clearSessionCookieHeader, destroySession } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  await destroySession(request.headers.get("cookie"));
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookieHeader(),
    },
  });
};
