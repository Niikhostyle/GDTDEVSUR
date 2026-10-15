import type { APIRoute } from "astro";
import { promises as fs } from "node:fs";
import path from "node:path";

const mime: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export const GET: APIRoute = async ({ params }) => {
  const rel = params.path;
  if (!rel || rel.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  const filePath = path.join(process.cwd(), "data", "uploads", rel);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": mime[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};
