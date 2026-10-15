import type { APIRoute } from "astro";
import { promises as fs } from "node:fs";
import path from "node:path";
import { verifySession } from "../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  if (!(await verifySession(request.headers.get("cookie")))) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "Archivo requerido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ext = path.extname(file.name || "").toLowerCase() || ".bin";
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf"];
  if (!allowed.includes(ext)) {
    return new Response(JSON.stringify({ error: "Tipo de archivo no permitido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const toWebp = [".jpg", ".jpeg", ".png"].includes(ext);
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${toWebp ? ".webp" : ext}`;
  try {
    const dir = path.join(process.cwd(), "data", "uploads");
    await fs.mkdir(dir, { recursive: true });
    let buffer: Buffer = Buffer.from(await file.arrayBuffer());
    if (toWebp) {
      const { default: sharp } = await import("sharp");
      buffer = await sharp(buffer)
        .rotate()
        .resize({ width: 2000, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    }
    await fs.writeFile(path.join(dir, name), buffer);
  } catch {
    return new Response(
      JSON.stringify({
        error: "En Cloudflare no se pueden subir archivos al disco. Usá una URL externa o redesplegá desde local.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ url: `/api/media/${name}` }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
};
