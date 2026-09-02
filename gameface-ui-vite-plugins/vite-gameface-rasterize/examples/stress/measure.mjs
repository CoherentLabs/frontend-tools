/**
 * Measures what the bake actually buys, using the Player's own tracing.
 *
 * rAF deltas are useless here: this Player paces frames at a fixed ~32 fps whether the page is
 * empty or drawing three hundred blurred boxes, so wall-clock frame time reports the same
 * number either way. The engine's trace events do reflect the work - `Coherent_GPU` is the
 * per-frame GPU time, which is precisely what a shadow costs and a textured quad does not.
 *
 * The same built output is served twice, once with the two generated tags stripped out, and
 * the Player is restarted between variants.
 *
 * Usage: node measure.mjs <baked-dist-dir> [playerPath]
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(path.join(process.cwd(), 'package.json'));
const CDP = require('chrome-remote-interface');

const ROOT = path.resolve(process.argv[2] ?? 'dist');
const PLAYER = process.argv[3] ?? process.env.GAMEFACE_PATH;
const TRACE_SECONDS = 6;

if (!PLAYER) {
    console.error('no Player: pass a path as the second argument or set GAMEFACE_PATH');
    process.exit(1);
}

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.webp': 'image/webp' };

function serve(strip) {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
            if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end();

            let body = fs.readFileSync(file);
            if (path.extname(file) === '.html' && strip) {
                body = Buffer.from(
                    body
                        .toString()
                        .replace(/[ \t]*<link[^>]*rasterize\.css[^>]*>\s*\n?/gi, '')
                        .replace(/[ \t]*<script[^>]*rasterize\.js[^>]*><\/script>\s*\n?/gi, '')
                );
            }

            res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
        });
        server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
    });
}

const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))];

async function waitFor(check, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        const value = await check();
        if (value) return value;
        await new Promise((r) => setTimeout(r, 150));
    }
    return null;
}

async function measure(label, port) {
    const debugPort = 9500 + Math.floor(Math.random() * 60);
    const url = `http://localhost:${port}/index.html`;
    const proc = spawn(
        PLAYER,
        [`--remote-debugging-port=${debugPort}`, '--no-first-run', '--enable-gui=false', '--width=1920', '--height=1080', url],
        { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    await waitFor(async () => {
        try {
            return (await fetch(`http://localhost:${debugPort}/json/version`)).ok;
        } catch {
            return false;
        }
    }, 25000);

    const target = await waitFor(async () => {
        const targets = await fetch(`http://localhost:${debugPort}/json/list`).then((r) => r.json()).catch(() => null);
        return Array.isArray(targets) && targets.length ? targets.find((t) => t.type === 'page') || targets[0] : null;
    }, 10000);

    const client = await CDP({ port: debugPort, local: true, target: `/devtools/page/${target.id}` });
    await client.Page.enable();
    await client.Runtime.enable();
    await client.Page.navigate({ url });
    await new Promise((r) => setTimeout(r, 2500));

    const events = [];
    client.Tracing.dataCollected(({ value }) => events.push(...value));
    const complete = new Promise((resolve) => client.Tracing.tracingComplete(resolve));

    await client.send('Tracing.start', { categories: 'disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });

    // The content has to be genuinely re-rendered every frame or there is nothing to measure:
    // cohtml repaints dirty regions only, so a small probe leaves the decorations untouched in
    // whatever the engine already had. Shifting the whole grid one pixel per frame invalidates
    // all of it, which is also what a real UI does whenever a list scrolls or a panel slides.
    await client.Runtime.evaluate({
        expression: `(function () {
            var stage = document.querySelector('.grid') || document.body;
            var n = 0;
            (function tick() {
                stage.style.transform = 'translateX(' + (n++ % 2) + 'px)';
                requestAnimationFrame(tick);
            })();
        })()`,
    });

    await new Promise((r) => setTimeout(r, TRACE_SECONDS * 1000));
    await client.send('Tracing.end');
    await complete;

    const durations = collect(events);
    await client.close();
    proc.kill();
    await new Promise((r) => setTimeout(r, 800));

    const stat = (name) => {
        const list = durations.get(name);
        if (!list?.length) return { p50: 0, p95: 0, frames: 0 };
        const sorted = list.slice().sort((a, b) => a - b);
        return { p50: +percentile(sorted, 50).toFixed(3), p95: +percentile(sorted, 95).toFixed(3), frames: list.length };
    };

    const gpu = stat('Coherent_GPU');
    const paint = stat('Coherent_Paint');

    return {
        variant: label,
        'GPU p50 (ms)': gpu.p50,
        'GPU p95 (ms)': gpu.p95,
        'Paint p50 (ms)': paint.p50,
        frames: gpu.frames || paint.frames,
    };
}

/** Pairs B/E trace events per (name, thread) and reads the duration off X events. */
function collect(events) {
    const open = new Map();
    const durations = new Map();

    const push = (map, key, value) => {
        const list = map.get(key);
        if (list) list.push(value);
        else map.set(key, [value]);
    };

    for (const event of events) {
        const key = `${event.name}|${event.tid}`;
        if (event.ph === 'B') {
            push(open, key, event.ts);
        } else if (event.ph === 'E') {
            const stack = open.get(key);
            if (stack?.length) push(durations, event.name, (event.ts - stack.pop()) / 1000);
        } else if (event.ph === 'X' && typeof event.dur === 'number') {
            push(durations, event.name, event.dur / 1000);
        }
    }

    return durations;
}

const live = await serve(true);
const baked = await serve(false);

console.table([await measure('live CSS', live.port), await measure('baked', baked.port)]);

live.server.close();
baked.server.close();
