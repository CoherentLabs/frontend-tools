/**
 * robots.txt: Astro integration
 *
 * After `astro build`, writes robots.txt into the build output: crawl rules for
 * every crawler, explicit groups for the AI search and training crawlers,
 * Content Signals (https://contentsignals.org) declaring how AI may use the
 * content, and the sitemap's URL.
 *
 * A robots.txt in `public/` is copied into the build first and wins: this one
 * is written only when the build has none. Crawlers read robots.txt only at a
 * host's root, so a site built under a sub-path (`base: "/cpp-gameface"`) gets
 * none; the root site of that host should publish it.
 *
 * The coherent-docs-theme Starlight plugin adds this integration automatically
 * on `astro build` (opt out with `robots: false`). Other Astro sites add it
 * themselves:
 *
 *   // astro.config.mjs
 *   import robotsTxt from "coherent-docs-theme/robots";
 *   export default defineConfig({ site: "https://coherent-labs.com", integrations: [robotsTxt()] });
 */

import { access, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

/** How AI may use the content (https://contentsignals.org). */
export interface ContentSignals {
  /** Show the content in search results. Default: true. */
  search?: boolean;
  /** Use the content as input to an AI answer (retrieval, grounding). Default: true. */
  aiInput?: boolean;
  /** Train or fine-tune AI models on the content. Default: true. */
  aiTrain?: boolean;
}

export interface RobotsTxtOptions {
  /** Content Signals for every crawler; `false` leaves the line out. */
  contentSignals?: ContentSignals | false;
  /** Paths no crawler should fetch, e.g. ["/internal/"]. Default: none. */
  disallow?: string[];
  /** AI crawlers given their own group (same rules, but named, so the policy is explicit). */
  aiCrawlers?: string[];
  /** Sitemap URLs. Default: the build's sitemap-index.xml (or sitemap.xml), if it has one. */
  sitemaps?: string[];
}

export const ROBOTS_FILE = "robots.txt";

/** AI search crawlers, AI training crawlers, then fetchers acting for a user. */
export const DEFAULT_AI_CRAWLERS = [
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "ChatGPT-User",
  "Claude-User",
  "Perplexity-User",
];

const SITEMAP_FILES = ["sitemap-index.xml", "sitemap.xml"];

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false
  );

export function renderRobotsTxt(options: RobotsTxtOptions & { sitemaps: string[] }): string {
  const { search = true, aiInput = true, aiTrain = true } = options.contentSignals || {};
  const yesNo = (value: boolean) => (value ? "yes" : "no");
  const rules = [
    "Allow: /",
    ...(options.disallow ?? []).map((path) => `Disallow: ${path}`),
    ...(options.contentSignals === false
      ? []
      : [`Content-Signal: search=${yesNo(search)}, ai-input=${yesNo(aiInput)}, ai-train=${yesNo(aiTrain)}`]),
  ];
  const aiCrawlers = options.aiCrawlers ?? DEFAULT_AI_CRAWLERS;

  const out = ["User-agent: *", ...rules];
  if (aiCrawlers.length) out.push("", ...aiCrawlers.map((bot) => `User-agent: ${bot}`), ...rules);
  if (options.sitemaps.length) out.push("", ...options.sitemaps.map((url) => `Sitemap: ${url}`));
  return out.join("\n") + "\n";
}

export default function robotsTxt(options: RobotsTxtOptions = {}): AstroIntegration {
  let site: URL | undefined;
  let base = "/";
  // @astrojs/sitemap (which Starlight adds when `site` is set) may write its file after this hook runs.
  let hasSitemapIntegration = false;
  return {
    name: "coherent-robots-txt",
    hooks: {
      "astro:config:done": ({ config }) => {
        if (config.site) site = new URL(config.site);
        base = config.base ?? "/";
        hasSitemapIntegration = config.integrations.some((i) => i.name === "@astrojs/sitemap");
      },
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        if (await exists(join(outDir, ROBOTS_FILE))) {
          logger.info(`${ROBOTS_FILE}: kept the one from public/`);
          return;
        }
        if (base.replace(/\/+$/, "") !== "") {
          logger.info(`${ROBOTS_FILE}: skipped, crawlers only read it at the host's root and this site is built under ${base}`);
          return;
        }

        let sitemaps = options.sitemaps;
        if (!sitemaps) {
          const found = (await Promise.all(SITEMAP_FILES.map((f) => exists(join(outDir, f))))).findIndex(Boolean);
          const file = found >= 0 ? SITEMAP_FILES[found] : hasSitemapIntegration ? SITEMAP_FILES[0] : undefined;
          sitemaps = file && site ? [new URL(file, site).href] : [];
        }

        await writeFile(join(outDir, ROBOTS_FILE), renderRobotsTxt({ ...options, sitemaps }));
        logger.info(`${ROBOTS_FILE}: written${sitemaps.length ? "" : " (no sitemap: set `site` in the Astro config)"}`);
      },
    },
  };
}
