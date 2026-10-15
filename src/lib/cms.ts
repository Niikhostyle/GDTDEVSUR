import { promises as fs } from "node:fs";
import path from "node:path";
import { COLLECTIONS, type CollectionId } from "./collections";
import { getPrisma, hasDatabase } from "./db";
import { deepMerge, type Locale } from "./locale";

export { COLLECTIONS, type CollectionId };

const contentDir = path.join(process.cwd(), "data", "content");
const contentEnDir = path.join(process.cwd(), "data", "content-en");
const submissionsPath = path.join(process.cwd(), "data", "submissions.json");

/** Contenido embebido (fallback sin BD / Cloudflare) */
const bundledEs = import.meta.glob("../../data/content/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const bundledEn = import.meta.glob("../../data/content-en/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

function isCollection(name: string): name is CollectionId {
  return COLLECTIONS.some((c) => c.id === name);
}

function collectionPath(name: CollectionId, locale: Locale = "es") {
  const dir = locale === "en" ? contentEnDir : contentDir;
  return path.join(dir, `${name}.json`);
}

function bundled(name: CollectionId, locale: Locale) {
  const map = locale === "en" ? bundledEn : bundledEs;
  const key = Object.keys(map).find((k) => k.endsWith(`/${name}.json`));
  return key ? structuredClone(map[key]) : null;
}

async function readJson(filePath: string) {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw.replace(/^\uFEFF/, ""));
}

async function readFromDb(name: CollectionId, locale: Locale) {
  const prisma = getPrisma();
  if (!prisma) return null;
  const row = await prisma.cmsDocument.findUnique({
    where: { collection_locale: { collection: name, locale } },
  });
  return row ? (row.data as unknown) : null;
}

async function readCollectionRaw(name: CollectionId, locale: Locale): Promise<unknown | null> {
  if (hasDatabase()) {
    try {
      const fromDb = await readFromDb(name, locale);
      if (fromDb != null) return structuredClone(fromDb);
    } catch (err) {
      console.warn(`[cms] DB read failed for ${name}/${locale}, fallback JSON:`, err);
    }
  }

  try {
    return await readJson(collectionPath(name, locale));
  } catch {
    return bundled(name, locale);
  }
}

export async function getCollection<T = unknown>(
  name: string,
  locale: Locale = "es",
): Promise<T> {
  if (!isCollection(name)) throw new Error(`Colección inválida: ${name}`);

  const base = await readCollectionRaw(name, "es");
  if (base == null) throw new Error(`No se pudo leer colección: ${name}`);

  if (locale !== "en") return base as T;

  const en = await readCollectionRaw(name, "en");
  return (en ? deepMerge(base, en) : base) as T;
}

export async function saveCollection(name: string, data: unknown, locale: Locale = "es") {
  if (!isCollection(name)) throw new Error(`Colección inválida: ${name}`);

  if (hasDatabase()) {
    const prisma = getPrisma();
    if (prisma) {
      await prisma.cmsDocument.upsert({
        where: { collection_locale: { collection: name, locale } },
        create: { collection: name, locale, data: data as object },
        update: { data: data as object },
      });
      return;
    }
  }

  try {
    const dir = locale === "en" ? contentEnDir : contentDir;
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, `${name}.json`), JSON.stringify(data, null, 2), "utf-8");
  } catch {
    throw new Error(
      "No se pudo guardar. Configurá DATABASE_URL (PostgreSQL) o editá en un entorno con disco.",
    );
  }
}

/** Fecha de la última edición del CMS (para lastmod del sitemap). */
export async function getContentLastModified(): Promise<Date | null> {
  if (!hasDatabase()) return null;
  try {
    const prisma = getPrisma();
    if (!prisma) return null;
    const row = await prisma.cmsDocument.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });
    return row?.updatedAt ?? null;
  } catch {
    return null;
  }
}

export async function getAllContent(locale: Locale = "es") {
  const entries = await Promise.all(
    COLLECTIONS.map(async (c) => [c.id, await getCollection(c.id, locale)] as const),
  );
  return Object.fromEntries(entries);
}

export type Submission = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  message: string;
  createdAt: string;
};

const memorySubmissions: Submission[] = [];

export async function listSubmissions(): Promise<Submission[]> {
  if (hasDatabase()) {
    const prisma = getPrisma();
    if (prisma) {
      const rows = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        company: r.company ?? undefined,
        message: r.message,
        createdAt: r.createdAt.toISOString(),
      }));
    }
  }

  try {
    const raw = await fs.readFile(submissionsPath, "utf-8");
    return JSON.parse(raw) as Submission[];
  } catch {
    return [...memorySubmissions];
  }
}

export async function addSubmission(
  input: Omit<Submission, "id" | "createdAt">,
): Promise<Submission> {
  if (hasDatabase()) {
    const prisma = getPrisma();
    if (prisma) {
      const row = await prisma.submission.create({
        data: {
          name: input.name,
          phone: input.phone,
          email: input.email,
          company: input.company || null,
          message: input.message,
        },
      });
      return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        company: row.company ?? undefined,
        message: row.message,
        createdAt: row.createdAt.toISOString(),
      };
    }
  }

  const item: Submission = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  try {
    const list = await listSubmissions();
    list.unshift(item);
    await fs.mkdir(path.dirname(submissionsPath), { recursive: true });
    await fs.writeFile(submissionsPath, JSON.stringify(list, null, 2), "utf-8");
  } catch {
    memorySubmissions.unshift(item);
  }

  return item;
}

export async function deleteSubmission(id: string) {
  if (hasDatabase()) {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.submission.delete({ where: { id } });
        return true;
      } catch {
        return false;
      }
    }
  }

  try {
    const list = await listSubmissions();
    const next = list.filter((s) => s.id !== id);
    await fs.writeFile(submissionsPath, JSON.stringify(next, null, 2), "utf-8");
    return next.length < list.length;
  } catch {
    const before = memorySubmissions.length;
    const idx = memorySubmissions.findIndex((s) => s.id === id);
    if (idx >= 0) memorySubmissions.splice(idx, 1);
    return memorySubmissions.length < before;
  }
}
