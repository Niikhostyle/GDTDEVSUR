import type { APIRoute } from "astro";
import { verifySession } from "../../../lib/auth";
import { COLLECTIONS, getCollection, saveCollection } from "../../../lib/cms";
import { enrichProcessStack } from "../../../lib/techIcons";

export const GET: APIRoute = async ({ params }) => {
  const name = params.collection;
  if (!name || !COLLECTIONS.some((c) => c.id === name)) {
    return new Response(JSON.stringify({ error: "Colección no encontrada" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
    });
  }
  try {
    const data = await getCollection(name);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "No se pudo leer" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  if (!(await verifySession(request.headers.get("cookie")))) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
    });
  }
  const name = params.collection;
  if (!name || !COLLECTIONS.some((c) => c.id === name)) {
    return new Response(JSON.stringify({ error: "Colección no encontrada" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
    });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
    });
  }
  const payload =
    name === "process"
      ? enrichProcessStack(body as Record<string, unknown>)
      : (body as Record<string, unknown>);
  await saveCollection(name, payload);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
};
