import type { APIRoute } from "astro";
import { verifySession } from "../../../lib/auth";
import { getAllContent } from "../../../lib/cms";

export const GET: APIRoute = async ({ request }) => {
  if (!(await verifySession(request.headers.get("cookie")))) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
    });
  }
  const content = await getAllContent();
  return new Response(JSON.stringify(content), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
};
