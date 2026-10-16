/**
 * Carga data/content (+ content-en) en PostgreSQL.
 * Uso: npm run db:seed
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const prisma = new PrismaClient();

const COLLECTIONS = [
  "site",
  "hero",
  "about",
  "services",
  "why",
  "differentials",
  "portfolio",
  "process",
  "clients",
  "blog",
  "faq",
  "contact",
  "news",
];

async function readJsonSafe(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch {
    return null;
  }
}

async function upsertLocale(locale, dirName) {
  const dir = path.join(root, "data", dirName);
  let count = 0;
  for (const collection of COLLECTIONS) {
    const data = await readJsonSafe(path.join(dir, `${collection}.json`));
    if (!data) continue;
    await prisma.cmsDocument.upsert({
      where: { collection_locale: { collection, locale } },
      create: { collection, locale, data },
      update: { data },
    });
    count += 1;
    console.log(`  ✓ ${locale}/${collection}`);
  }
  return count;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("Falta DATABASE_URL. Copiá .env.example → .env y levantá Docker.");
  }

  console.log("Seed CMS → PostgreSQL\n");
  const es = await upsertLocale("es", "content");
  const en = await upsertLocale("en", "content-en");
  console.log(`\nListo: ${es} ES + ${en} EN documentos.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
