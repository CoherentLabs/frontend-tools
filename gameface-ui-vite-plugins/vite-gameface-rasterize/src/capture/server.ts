import http from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { findFreePort } from './player.js';

const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.mp4': 'video/mp4',
    '.wasm': 'application/wasm',
};

export interface StaticServer {
    origin: string;
    close: () => Promise<void>;
}

/**
 * Serves the built output over HTTP for the capture pass.
 *
 * Two reasons this exists instead of loading dist/index.html from disk: file:// pages hit
 * different security rules in the engine than the game will, and serving lets us inject the
 * probe script into the HTML on the fly - `Page.addScriptToEvaluateOnNewDocument` is accepted
 * by the Player and then never runs, so a build-time injection is the only way to observe
 * addEventListener calls before the app's bundle makes them.
 */
export interface ServeOptions {
    /**
     * Markup inserted at the very top of <head> - the probe and the route `preload` hook use
     * this. A function receives the request path, so different routes can be seeded differently.
     */
    injectHead?: string | ((pathname: string) => string | undefined);
    /** Rewrites HTML before it is served; verification uses it to serve the pre-bake page. */
    transformHtml?: (html: string) => string;
}

export async function serveDirectory(root: string, serveOptions: ServeOptions = {}): Promise<StaticServer> {
    const { injectHead, transformHtml } = serveOptions;
    const port = await findFreePort(5170);

    const server = http.createServer(async (req, res) => {
        try {
            const url = new URL(req.url ?? '/', 'http://localhost');
            let filePath = path.join(root, decodeURIComponent(url.pathname));

            const stat = await fs.stat(filePath).catch(() => null);
            if (stat?.isDirectory()) filePath = path.join(filePath, 'index.html');

            // Never let a crafted path escape the served directory.
            if (!path.resolve(filePath).startsWith(path.resolve(root))) {
                res.writeHead(403).end('forbidden');
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const type = MIME[ext] ?? 'application/octet-stream';

            if (ext === '.html' && (injectHead || transformHtml)) {
                const head = typeof injectHead === 'function' ? injectHead(url.pathname) : injectHead;
                let html = await fs.readFile(filePath, 'utf8');
                if (transformHtml) html = transformHtml(html);
                if (head) html = insertIntoHead(html, head);
                res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' }).end(html);
                return;
            }

            const exists = await fs.stat(filePath).catch(() => null);
            if (!exists?.isFile()) {
                res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
                return;
            }

            res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
            createReadStream(filePath).pipe(res);
        } catch (error: any) {
            res.writeHead(500, { 'content-type': 'text/plain' }).end(String(error?.message ?? error));
        }
    });

    await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', resolve));

    return {
        origin: `http://localhost:${port}`,
        close: () => new Promise<void>((resolve) => server.close(() => resolve())),
    };
}

/**
 * Builds a head injector that adds the probe and each route's `preload` script, before any of the
 * app's own scripts run. This is the only way in on this engine:
 * `Page.addScriptToEvaluateOnNewDocument` is accepted and never runs.
 */
export function headInjector(
    routes: { path: string; preload?: string }[],
    always = ''
): (pathname: string) => string | undefined {
    const byPath = new Map<string, string>();

    for (const route of routes) {
        if (!route.preload) continue;
        const file = route.path.split(/[?#]/)[0].replace(/^\//, '');
        byPath.set(file, `<script>${route.preload}</script>`);
    }

    if (!byPath.size) return () => always || undefined;

    return (pathname: string) => {
        const file = decodeURIComponent(pathname).replace(/^\//, '') || 'index.html';
        const preload = byPath.get(file) ?? '';
        const combined = always + preload;
        return combined || undefined;
    };
}

/** Puts the probe first, before any of the app's own scripts have a chance to run. */
function insertIntoHead(html: string, snippet: string): string {
    const headOpen = html.match(/<head[^>]*>/i);
    if (headOpen) {
        const at = headOpen.index! + headOpen[0].length;
        return html.slice(0, at) + snippet + html.slice(at);
    }
    const htmlOpen = html.match(/<html[^>]*>/i);
    if (htmlOpen) {
        const at = htmlOpen.index! + htmlOpen[0].length;
        return html.slice(0, at) + `<head>${snippet}</head>` + html.slice(at);
    }
    return snippet + html;
}
