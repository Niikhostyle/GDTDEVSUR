import type { APIRoute } from "astro";
import { buildLlmsTxt, llmsResponse } from "../lib/llms";
import { siteOrigin } from "../lib/seo";

export const GET: APIRoute = async ({ site, url }) =>
  llmsResponse(await buildLlmsTxt(siteOrigin(site, url.origin)));
