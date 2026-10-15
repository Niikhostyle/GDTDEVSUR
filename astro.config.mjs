import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** VPS / Node por defecto; Cloudflare solo si ASTRO_ADAPTER=cloudflare */
const useCloudflare = process.env.ASTRO_ADAPTER === "cloudflare";

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://gdtdevsur.cl",
  output: "server",
  adapter: useCloudflare
    ? cloudflare()
    : node({ mode: "standalone" }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.join(root, "src"),
      },
    },
  },
});
