/// <reference types="astro/client" />
/**
 * WebMCP tools: lets an AI agent in the browser search and read these docs.
 *
 * Registered on page load through the WebMCP API (https://webmachinelearning.github.io/webmcp/),
 * only in browsers that have it; anywhere else this does nothing. Pagefind, which search_docs
 * uses, loads only when an agent first searches, so visitors pay nothing.
 *
 * The tools read what the agent docs integration writes on build: each page's index.html.md
 * and llms.txt.
 */

interface ModelContext {
    registerTool(tool: object, options?: { signal?: AbortSignal }): Promise<void> | void;
}

interface PagefindResult {
    data(): Promise<{ url: string; excerpt: string; meta: { title?: string } }>;
}

const MAX_RESULTS = 20;
const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");

const text = (value: string) => ({ content: [{ type: "text", text: value }] });
const stripTags = (html: string) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

// A plain import() of a runtime URL: Vite wraps import() in its preload helper, which breaks when
// Astro inlines this small script into the page (`__VITE_PRELOAD__ is not defined`).
const importUrl = new Function("url", "return import(url)") as (url: string) => Promise<any>;

let pagefind: Promise<{ search(query: string): Promise<{ results: PagefindResult[] }> }> | undefined;
const loadPagefind = () =>
    (pagefind ??= (async () => {
        const pf = await importUrl(`${base}pagefind/pagefind.js`);
        await pf.options({ basePath: `${base}pagefind/` });
        await pf.init();
        return pf;
    })());

/** A page URL (or path) on this site -> its Markdown version's URL. */
function markdownUrl(page: string): URL {
    const url = new URL(page, location.href);
    if (url.origin !== location.origin) throw new Error(`Only pages on ${location.origin} can be read`);
    url.hash = "";
    url.search = "";
    if (url.pathname.endsWith("/")) url.pathname += "index.html.md";
    else if (url.pathname.endsWith(".html")) url.pathname += ".md";
    else if (!url.pathname.endsWith(".md")) url.pathname += "/index.html.md";
    return url;
}

async function fetchText(url: URL | string, what: string): Promise<string> {
    const res = await fetch(url);
    const type = res.headers.get("content-type") ?? "";
    // A missing file comes back as the site's HTML 404 page.
    if (!res.ok || type.includes("text/html")) throw new Error(`${what} not found (${url})`);
    return res.text();
}

const tools = [
    {
        name: "search_docs",
        title: "Search the documentation",
        description: `Full-text search of this documentation site (${document.title.split("|").pop()?.trim() ?? location.host}). Returns the best-matching pages with an excerpt; read one with get_page.`,
        inputSchema: {
            type: "object",
            properties: {
                query: { type: "string", description: "What to search for, e.g. a feature, API or error message." },
                limit: { type: "integer", minimum: 1, maximum: MAX_RESULTS, default: 5, description: "How many results to return." },
            },
            required: ["query"],
        },
        annotations: { readOnlyHint: true },
        async execute({ query, limit = 5 }: { query: string; limit?: number }) {
            const pf = await loadPagefind().catch((err) => {
                pagefind = undefined;
                throw new Error(`Search isn't available on this page: ${err instanceof Error ? err.message : err}`);
            });
            const { results } = await pf.search(String(query));
            const top = await Promise.all(results.slice(0, Math.min(Math.max(1, limit), MAX_RESULTS)).map((r: PagefindResult) => r.data()));
            if (!top.length) return text(`No results for "${query}".`);
            return text(
                top
                    .map((r, i) => {
                        const url = new URL(r.url, location.origin).href;
                        return `${i + 1}. ${r.meta.title ?? url}\n   ${url}\n   ${stripTags(r.excerpt)}`;
                    })
                    .join("\n\n")
            );
        },
    },
    {
        name: "get_page",
        title: "Read a documentation page",
        description: "Returns a page of this site as Markdown (its content without navigation). Pass a page URL or path; without one, returns the current page.",
        inputSchema: {
            type: "object",
            properties: {
                url: { type: "string", description: "The page's URL or path on this site. Default: the current page." },
            },
        },
        annotations: { readOnlyHint: true },
        async execute({ url }: { url?: string }) {
            const target = markdownUrl(url || location.pathname);
            return text(await fetchText(target, "Markdown version of the page"));
        },
    },
    {
        name: "list_pages",
        title: "List the documentation pages",
        description: "Returns this site's llms.txt: every page, grouped by section, with a one-line description and the URL of its Markdown version.",
        inputSchema: { type: "object", properties: {} },
        annotations: { readOnlyHint: true },
        async execute() {
            return text(await fetchText(`${base}llms.txt`, "llms.txt"));
        },
    },
];

const modelContext: ModelContext | undefined = (document as any).modelContext ?? (navigator as any).modelContext;
const registered = "__coherentWebMcp";

if (modelContext && !(window as any)[registered]) {
    (window as any)[registered] = true;
    for (const tool of tools) {
        Promise.resolve()
            .then(() => modelContext.registerTool(tool))
            .catch((err) => console.warn(`WebMCP: couldn't register ${tool.name}`, err));
    }
}
