import type { APIRoute } from "astro";
import { verifySession } from "../../../lib/auth";

export const GET: APIRoute = async ({ request }) => {
  const authenticated = await verifySession(request.headers.get("cookie"));
  return new Response(JSON.stringify({ authenticated }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
};
