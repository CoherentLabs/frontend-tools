import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import * as pagefind from "pagefind";

const CONTENT_TYPES: Record<string, string> = {
    ".js": "text/javascript",
    ".json": "application/json",
};

const INDEX_BASENAMES = ["index.md", "index.mdx", "index.mdoc"];
const CRAWL_CONCURRENCY = 8;
const CRAWLER_ENV_FLAG = "COHERENT_PAGEFIND_CRAWLER";
const CRAWLER_READY_TIMEOUT_MS = 30000;

function resolveOwningContentFile(contentDir: string, filePath: string): string | null {
    const rel = path.relative(contentDir, filePath);
    if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
    if (!/\.(md|mdx|mdoc)$/i.test(filePath)) return null;

    if (!path.basename(filePath).startsWith("_")) return filePath;

    let dir = path.dirname(filePath);
    while (dir.startsWith(contentDir)) {
        for (const indexName of INDEX_BASENAMES) {
            const candidate = path.join(dir, indexName);
            if (existsSync(candidate)) return candidate;
        }
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return null;
}

function entryToRoute(entry: any): string {
    const slug = entry.id === "index" ? "" : entry.id;
    return `/${slug}/`.replace(/\/+/g, "/");
}

async function getDocsEntries(server: any): Promise<any[]> {
    const mod = await server.ssrLoadModule("astro:content");
    return mod.getCollection("docs");
}

async function resolveRouteViaCollection(server: any, root: string, owningFilePath: string): Promise<string | null> {
    const entries = await getDocsEntries(server);
    const target = path.resolve(owningFilePath).toLowerCase();

    for (const entry of entries) {
        const entryPath = entry.filePath ? path.resolve(root, entry.filePath) : null;
        if (entryPath && entryPath.toLowerCase() === target) return entryToRoute(entry);
    }
    return null;
}

async function waitForServerReady(origin: string, timeoutMs: number): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(origin);
            if (res.status < 500) return true;
        } catch { }
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    return false;
}

const PROGRESS_BAR_WIDTH = 30;
let lastNonTtyPercent = -1;

function renderCrawlProgress(current: number, total: number, label: string) {
    if (total <= 0) return;
    const ratio = current / total;
    const percent = Math.round(ratio * 100);

    if (!process.stdout.isTTY) {
        if (percent === lastNonTtyPercent || percent % 10 !== 0) return;
        lastNonTtyPercent = percent;
        console.log(`[pagefind-dev] indexing ${current}/${total} (${percent}%)`);
        return;
    }

    const filled = Math.round(PROGRESS_BAR_WIDTH * ratio);
    const bar = "█".repeat(filled) + "░".repeat(PROGRESS_BAR_WIDTH - filled);
    const prefix = `\r\x1b[36m[pagefind-dev]\x1b[0m [${bar}] ${String(percent).padStart(3)}% (${current}/${total}) `;
    // Strip ANSI codes when measuring length, otherwise the padding math undercounts and leaves
    // stray characters from a longer previous line un-overwritten.
    const visiblePrefixLen = prefix.replace(/\x1b\[[0-9;]*m/g, "").length;
    const cols = process.stdout.columns || 80;
    const maxLabelLen = Math.max(0, cols - visiblePrefixLen - 1);
    const truncatedLabel = label.length > maxLabelLen ? `${label.slice(0, Math.max(0, maxLabelLen - 1))}…` : label;
    const pad = " ".repeat(Math.max(0, cols - visiblePrefixLen - truncatedLabel.length - 1));
    process.stdout.write(prefix + truncatedLabel + pad);
}

// Crawls every route via a disposable `astro dev` child process instead of the real dev server 
// Writes each page's rendered HTML to a temp directory mirroring dist/'s own `<route>/index.html` layout, which `index.addDirectory` (used by the
// caller) already knows how to read — same convention Starlight's own build-time pagefind
// integration uses.
async function crawlViaThrowawayServer(realServer: any, root: string, logger: any): Promise<string | null> {
    const astroBin = path.join(root, "node_modules", "astro", "astro.js");
    if (!existsSync(astroBin)) {
        logger.warn(`[pagefind-dev] couldn't find ${astroBin} — skipping crawl`);
        return null;
    }

    const entries = await getDocsEntries(realServer);
    const routes = entries.map(entryToRoute);

    const port = 45000 + Math.floor(Math.random() * 10000);
    const origin = `http://localhost:${port}`;
    const outputChunks: string[] = [];
    const child = spawn(process.execPath, [astroBin, "dev", "--port", String(port)], {
        cwd: root,
        env: { ...process.env, [CRAWLER_ENV_FLAG]: "1" },
        stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout?.on("data", (chunk) => outputChunks.push(chunk.toString()));
    child.stderr?.on("data", (chunk) => outputChunks.push(chunk.toString()));

    let exited = false;
    child.once("exit", () => {
        exited = true;
    });

    // Deliberately outside `root` — the real dev server's own file watcher scans the whole project
    // tree, and writing hundreds of files inside it (even under .astro/) floods that watcher with
    // irrelevant change events (confirmed empirically: a wall of noisy [watch] log lines during the
    // crawl). os.tmpdir() is outside anything either server is watching.
    const tempDir = path.join(tmpdir(), `pagefind-dev-crawl-${Date.now()}`);

    try {
        const ready = await waitForServerReady(origin, CRAWLER_READY_TIMEOUT_MS);
        if (!ready || exited) {
            logger.warn(
                `[pagefind-dev] throwaway crawler server didn't come up in time:\n${outputChunks.join("").slice(-2000)}`,
            );
            return null;
        }

        await rm(tempDir, { recursive: true, force: true }).catch(() => { });

        let written = 0;
        let processed = 0;
        lastNonTtyPercent = -1;
        const queue = [...routes];
        async function worker() {
            while (queue.length > 0) {
                const route = queue.shift();
                if (!route) return;
                try {
                    const res = await fetch(new URL(route, origin));
                    if (res.ok) {
                        const html = await res.text();
                        const filePath = path.join(tempDir, route, "index.html");
                        await mkdir(path.dirname(filePath), { recursive: true });
                        await writeFile(filePath, html);
                        written++;
                    }
                } catch {
                    // skip this page, keep going
                } finally {
                    processed++;
                    renderCrawlProgress(processed, routes.length, route);
                }
            }
        }
        await Promise.all(Array.from({ length: CRAWL_CONCURRENCY }, worker));
        if (process.stdout.isTTY) process.stdout.write("\n");
        logger.info(`[pagefind-dev] crawled ${written}/${routes.length} pages via throwaway server`);
        return tempDir;
    } finally {
        if (!exited) child.kill();
    }
}

export default function devPagefindPlugin(): AstroIntegration {
    if (process.env[CRAWLER_ENV_FLAG]) {
        return { name: "coherent-docs-theme-dev-pagefind", hooks: {} };
    }

    let index: any = null;
    let filesCache: Map<string, Uint8Array> | null = null;
    let devOrigin = "";
    let root = "";
    let serverRef: any = null;
    let seedPromise: Promise<void> | null = null;
    let contentDir = "";
    const pending = new Map<string, NodeJS.Timeout>();

    async function getFilesCached() {
        if (!filesCache) {
            const { files } = await index.getFiles();
            filesCache = new Map(files.map((f: any) => [f.path.replace(/\\/g, "/"), f.content]));
        }
        return filesCache;
    }

    async function fetchAndIndex(route: string, logger: any): Promise<{ ok: boolean; uniqueWords?: number }> {
        try {
            const res = await fetch(new URL(`${route}?_pf=${Date.now()}`, devOrigin));
            if (!res.ok) return { ok: false };
            const html = await res.text();
            const { errors, file } = await index.addHTMLFile({ url: route, content: html });
            if (errors.length) {
                logger.warn(`[pagefind-dev] index ${route} had errors: ${errors.join(", ")}`);
                return { ok: false };
            }
            return { ok: true, uniqueWords: file.uniqueWords };
        } catch {
            return { ok: false };
        }
    }

    async function reindexRoute(route: string, logger: any) {
        const result = await fetchAndIndex(route, logger);
        if (result.ok) {
            filesCache = null;
            logger.info(`[pagefind-dev] reindexed ${route} (${result.uniqueWords} unique words)`);
        } else {
            logger.warn(`[pagefind-dev] couldn't fetch a rendered page for route "${route}" to reindex it`);
        }
    }

    async function crawlAndSeed(server: any, logger: any) {
        const start = Date.now();
        const tempDir = await crawlViaThrowawayServer(server, root, logger);
        if (!tempDir) {
            logger.warn(`[pagefind-dev] crawl produced no pages — search will stay empty this session`);
            return;
        }
        const seeded = await index.addDirectory({ path: tempDir });
        if (seeded.errors.length) {
            logger.warn(`[pagefind-dev] indexing crawled pages had errors: ${seeded.errors.join(", ")}`);
        }
        await rm(tempDir, { recursive: true, force: true }).catch(() => { });
        filesCache = null;
        logger.info(
            `[pagefind-dev] indexed ${seeded.page_count ?? "?"} pages from the crawl in ${Date.now() - start}ms total`,
        );
    }

    function scheduleReindex(filePath: string, server: any, logger: any) {
        const owningFile = resolveOwningContentFile(contentDir, filePath);
        if (!owningFile) return;
        const existing = pending.get(owningFile);
        if (existing) clearTimeout(existing);
        pending.set(
            owningFile,
            setTimeout(async () => {
                pending.delete(owningFile);
                if (seedPromise) await seedPromise;
                const route = await resolveRouteViaCollection(server, root, owningFile);
                if (!route) {
                    logger.warn(`[pagefind-dev] no collection entry found for ${owningFile}`);
                    return;
                }
                await reindexRoute(route, logger);
            }, 50),
        );
    }

    return {
        name: "coherent-docs-theme-dev-pagefind",
        hooks: {
            "astro:config:setup": ({ config, updateConfig, logger }: any) => {
                root = fileURLToPath(config.root);
                contentDir = path.join(root, "src", "content", "docs");
                updateConfig({
                    vite: {
                        define: {
                            "import.meta.env.PAGEFIND_DEV_AVAILABLE": "true",
                        },
                        plugins: [
                            {
                                name: "coherent-docs-theme-dev-pagefind-hmr",
                                // Runs after other plugins' handleHotUpdate (notably Astro/Starlight's
                                // own content-layer handling), so the collection is already settled by
                                // the time this fires.
                                enforce: "post",
                                async handleHotUpdate(ctx: any) {
                                    scheduleReindex(ctx.file, ctx.server, logger);
                                },
                            },
                        ],
                    },
                });
            },
            "astro:server:setup": async ({ server, logger }: any) => {
                serverRef = server;

                const created = await pagefind.createIndex({});
                if (created.errors.length || !created.index) {
                    logger.warn(`[pagefind-dev] createIndex failed: ${created.errors.join(", ")}`);
                    return;
                }
                index = created.index;

                server.middlewares.use("/pagefind", async (req: any, res: any) => {
                    if (seedPromise) await seedPromise;
                    const files = await getFilesCached();
                    const reqPath = decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "");
                    const bytes = files.get(reqPath);
                    if (!bytes) {
                        res.statusCode = 404;
                        res.end();
                        return;
                    }
                    res.setHeader("Content-Type", CONTENT_TYPES[path.extname(reqPath)] ?? "application/octet-stream");
                    res.statusCode = 200;
                    res.end(Buffer.from(bytes));
                });
            },
            "astro:server:start": ({ address, logger }: any) => {
                devOrigin = `http://localhost:${address.port}`;
                if (index && serverRef) {
                    console.log(`\n\x1b[36m[pagefind-dev]\x1b[0m Building search index, please wait...\n`);
                    seedPromise = crawlAndSeed(serverRef, logger)
                        .then(() => {
                            console.log(
                                `\n\x1b[32m[pagefind-dev]\x1b[0m Search index ready — documentation running at \x1b[36m${devOrigin}/\x1b[0m\n`,
                            );
                        })
                        .catch((err) => {
                            logger.warn(`[pagefind-dev] crawl failed: ${err?.message ?? err}`);
                        });
                }
            },
        },
    };
}
