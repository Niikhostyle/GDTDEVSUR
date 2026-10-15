import type { APIRoute } from "astro";
import { verifySession } from "../../../lib/auth";
import {
  addSubmission,
  deleteSubmission,
  listSubmissions,
} from "../../../lib/cms";
import { sendContactEmails } from "../../../lib/mailer";
import {
  containsDangerousContent,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  sanitizeCompany,
  sanitizeMessage,
  sanitizeName,
} from "../../../lib/contactSecurity";

export const GET: APIRoute = async ({ request }) => {
  if (!(await verifySession(request.headers.get("cookie")))) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const items = await listSubmissions();
  return new Response(JSON.stringify(items), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (body?.website) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!body?.name || !body?.phone || !body?.email || !body?.message) {
    return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const name = sanitizeName(String(body.name));
  const phone = normalizePhone(String(body.phone));
  const email = String(body.email).trim().slice(0, 160).toLowerCase();
  const company = body.company ? sanitizeCompany(String(body.company)) : "";

  if (!name) {
    return new Response(JSON.stringify({ error: "El nombre no es válido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!isValidPhone(phone)) {
    return new Response(
      JSON.stringify({ error: "El teléfono solo puede contener números (8 a 15 dígitos)" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: "El email no es válido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (
    containsDangerousContent(String(body.name)) ||
    containsDangerousContent(String(body.company || ""))
  ) {
    return new Response(JSON.stringify({ error: "Los datos contienen contenido no permitido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const msg = sanitizeMessage(String(body.message));
  if (!msg.ok) {
    return new Response(JSON.stringify({ error: msg.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const item = await addSubmission({
    name,
    phone,
    email,
    company,
    message: msg.value,
  });

  try {
    await sendContactEmails({
      name: item.name,
      phone: item.phone,
      email: item.email,
      company: item.company,
      message: item.message,
    });
  } catch (err) {
    console.error("[submissions] mail:", err);
  }

  return new Response(JSON.stringify({ ok: true, id: item.id }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!(await verifySession(request.headers.get("cookie")))) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "id requerido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  const ok = await deleteSubmission(id);
  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 404,
    headers: { "Content-Type": "application/json" },
  });
};
