import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { RasterizeManifest } from './contract.js';
import type { ResolvedOptions, RasterizeRoute } from './config.js';
import type { DiagnosticBag } from './diagnostics.js';
import type { PlayerSession } from './capture/session.js';
import { headInjector, serveDirectory, type StaticServer } from './capture/server.js';
import { decode, type RawImage } from './image.js';

export interface UnresolvedElement {
    tag: string;
    classes: string[];
    selectorPath: string;
}

export interface RouteAudit {
    route: string;
    /** Path of the written diff image, relative to the output directory. */
    diff: string;
    /** Share of pixels that differ beyond the per-channel tolerance, 0..1. */
    difference: number;
    /** How much the page differs from *itself* over two renders - its own instability. */
    baseline: number;
    marked: number;
    resolved: number;
    unresolved: UnresolvedElement[];
}

export interface AuditOptions {
    session: PlayerSession;
    options: ResolvedOptions;
    outDir: string;
    routes: RasterizeRoute[];
    manifest: RasterizeManifest;
    bag: DiagnosticBag;
    log: (message: string) => void;
}

/** Below this the two renders are the same picture as far as anyone looking at it is concerned. */
const CHANNEL_TOLERANCE = 8;

/**
 * Renders the finished build twice - once as shipped, once with the two generated tags removed -
 * and writes the pair plus their difference as one image.
 *
 * This is the cheapest check the pipeline has and the only one that sees the page as a whole.
 * Verification compares elements in isolation and will happily report a perfect score for a
 * texture that never reached the DOM, sits in the wrong place, or replaced a decoration with
 * nothing; a picture of the whole route catches all three without being told what to look for.
 *
 * The same pass counts how many marked elements actually received a texture, which is the other
 * question a green build cannot currently answer.
 */
export async function auditBuild(input: AuditOptions): Promise<RouteAudit[]> {
    const { session, options, outDir, routes, manifest, bag, log } = input;

    const reportDir = path.join(outDir, options.outDir, 'report');
    await fs.mkdir(reportDir, { recursive: true });

    let bakedServer: StaticServer | undefined;
    let liveServer: StaticServer | undefined;
    const audits: RouteAudit[] = [];

    try {
        const injectHead = headInjector(routes);
        bakedServer = await serveDirectory(outDir, { injectHead });
        liveServer = await serveDirectory(outDir, { injectHead, transformHtml: stripGeneratedTags });

        for (const route of routes) {
            const baked = await renderRoute(session, `${bakedServer.origin}/${route.path}`, route);
            const resolution = await countResolved(session);
            const live = await renderRoute(session, `${liveServer.origin}/${route.path}`, route);

            // The same page rendered twice, so the comparison can tell "the bake changed this"
            // from "this page does not draw the same thing twice". Without it a HUD that ticks a
            // simulation reports a large number and the bake gets the blame.
            const control = await renderRoute(session, `${liveServer.origin}/${route.path}`, route);
            const baseline = compareFrames(live, control).difference;

            const { difference, delta } = compareFrames(live, baked);
            const name = `${route.path.replace(/[^\w.-]+/g, '_')}.png`;
            const file = path.join(reportDir, name);
            await writePanels([live, baked, delta], file);

            const audit: RouteAudit = {
                route: route.path,
                diff: path.join(options.outDir, 'report', name).replace(/\\/g, '/'),
                difference,
                baseline,
                marked: resolution.marked,
                resolved: resolution.resolved,
                unresolved: resolution.unresolved,
            };

            audits.push(audit);
            report(audit, manifest, options, bag);
            log(
                `${route.path}: ${resolution.resolved}/${resolution.marked} marked elements textured, ` +
                    `${(difference * 100).toFixed(2)}% of pixels differ` +
                    `${baseline > 0.0005 ? ` (${(baseline * 100).toFixed(2)}% of which the page differs from itself)` : ''}` +
                    ` - ${audit.diff}`
            );
        }
    } finally {
        if (bakedServer) await bakedServer.close();
        if (liveServer) await liveServer.close();
    }

    return audits;
}

function report(audit: RouteAudit, manifest: RasterizeManifest, options: ResolvedOptions, bag: DiagnosticBag): void {
    if (audit.unresolved.length) {
        const keys = new Map<string, number>();
        for (const matcher of manifest.matchers) {
            const key = `${matcher.tag}|${[...matcher.classes].sort().join('.')}`;
            keys.set(key, (keys.get(key) ?? 0) + 1);
        }

        // One component that missed six times is one problem. Grouping by what identifies the
        // element - its tag and classes - says that, where a list of six selector paths does not.
        const groups = new Map<string, { tag: string; classes: string[]; count: number; example: string }>();
        for (const el of audit.unresolved) {
            const key = `${el.tag}|${[...el.classes].sort().join('.')}`;
            const existing = groups.get(key);
            if (existing) existing.count++;
            else groups.set(key, { tag: el.tag, classes: el.classes, count: 1, example: el.selectorPath });
        }

        const explained = [...groups.values()]
            .sort((a, b) => b.count - a.count)
            .map((group) => {
                const selector = `<${group.tag}${group.classes.map((c) => `.${c}`).join('')}>`;
                const times = group.count > 1 ? ` x${group.count}` : '';
                const key = `${group.tag}|${[...group.classes].sort().join('.')}`;
                const shared = keys.get(key) ?? 0;

                if (!group.classes.length) {
                    return `${selector}${times}: no classes at runtime, so there is no key to match on`;
                }
                if (shared > 1) {
                    return `${selector}${times}: its key is shared by ${shared} bakes and none of their ancestor classes matched`;
                }
                if (shared === 1) {
                    return `${selector}${times}: matched by document position only, so its lookalikes stayed live`;
                }

                // The common near miss: a runtime class on the marked element changed its key.
                // The build knows both class lists, so it can say which class did it.
                const nearMiss = findNearMiss(group.classes, group.tag, manifest);
                if (nearMiss) {
                    return (
                        `${selector}${times}: no texture. One exists for <${group.tag}${nearMiss.classes
                            .map((c) => `.${c}`)
                            .join('')}>, but these carry an extra class (${nearMiss.extra.join(', ')}), ` +
                        'so the matcher does not apply. If that class does not change the decoration, keep it off ' +
                        'the marked element'
                    );
                }

                return `${selector}${times}: nothing was baked for it. Example: ${group.example}`;
            });

        bag.add(
            'RZ022',
            audit.route,
            `${audit.unresolved.length} of ${audit.marked} marked elements have no texture in the built page:\n        ` +
                explained.join('\n        '),
            audit.route
        );
    }

    // Judge the bake by what it added to the page's own instability. A scene that ticks a
    // simulation differs from itself, and charging that to the bake is what makes people raise
    // the threshold until the check is dead.
    const attributable = Math.max(0, audit.difference - audit.baseline);

    if (audit.baseline > options.diffThreshold && audit.difference <= audit.baseline * 1.5) {
        bag.add(
            'RZ023',
            audit.route,
            `${(audit.difference * 100).toFixed(2)}% of pixels differ, but two renders of the *unbaked* page ` +
                `differ by ${(audit.baseline * 100).toFixed(2)}% - so this page does not render identically twice ` +
                'and the comparison cannot say anything about the bake. Freeze it with the route setup hook, or ' +
                "seed its initial state with preload: 'Math.random = () => 0.5;'",
            audit.route
        );
    } else if (attributable > options.diffThreshold) {
        bag.add(
            'RZ023',
            audit.route,
            `${(attributable * 100).toFixed(2)}% of pixels differ because of the bake ` +
                `(${(audit.difference * 100).toFixed(2)}% total, less ${(audit.baseline * 100).toFixed(2)}% the page ` +
                `differs from itself; threshold ${(options.diffThreshold * 100).toFixed(2)}%). Look at ${audit.diff} - ` +
                'three panels, keyed by the colour stripe down their left edge: green is live CSS, blue is what ' +
                'shipped, red marks where they disagree',
            audit.route
        );
    }
}

/**
 * Finds a baked matcher whose classes are a subset of this element's, which is the shape of the
 * commonest miss: a state class the app adds at runtime - `status-dead`, a marker class with no
 * CSS behind it - lengthens the key and costs the element its texture.
 */
function findNearMiss(
    classes: string[],
    tag: string,
    manifest: RasterizeManifest
): { classes: string[]; extra: string[] } | null {
    const owned = new Set(classes);
    let best: { classes: string[]; extra: string[] } | null = null;

    for (const matcher of manifest.matchers) {
        if (matcher.tag !== tag || !matcher.classes.length) continue;
        if (!matcher.classes.every((c) => owned.has(c))) continue;

        const extra = classes.filter((c) => !matcher.classes.includes(c));
        if (!extra.length) continue;
        if (!best || matcher.classes.length > best.classes.length) best = { classes: matcher.classes, extra };
    }

    return best;
}

/** Loads a route, runs its setup hook, stills every animation, and screenshots the viewport. */
async function renderRoute(session: PlayerSession, url: string, route: RasterizeRoute): Promise<RawImage> {
    await session.goto(url, route.settleMs ?? 300);

    if (route.setup) {
        await session.evaluateRaw(`(async () => { ${route.setup} })()`);
        await session.settle(route.settleMs ?? 300);
    }

    // Two loads of the same page catch animations at different phases, which would swamp the
    // difference with motion that has nothing to do with baking. Pausing is not enough - it
    // freezes each load wherever it happened to be - so animations are switched off entirely and
    // both renders show the un-animated state. cohtml ignores stylesheets added after parse, so
    // this has to be written onto the elements themselves.
    await session.evaluateRaw(`(function () {
        var all = document.querySelectorAll('*');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            var cs = getComputedStyle(el);
            if (cs.animationName && cs.animationName !== 'none') el.style.animation = 'none';
            if (cs.transitionProperty && cs.transitionProperty !== 'none') el.style.transition = 'none';
        }
        return all.length;
    })()`);

    await session.settle(120);

    const viewport = await session.viewport();
    const png = await session.screenshot({ x: 0, y: 0, width: viewport.width, height: viewport.height });
    return decode(png);
}

/** Asks the shipped page how many marked elements actually ended up with a texture. */
async function countResolved(session: PlayerSession): Promise<{ marked: number; resolved: number; unresolved: UnresolvedElement[] }> {
    return session.evaluateRaw(`(function () {
        function classesOf(el) {
            var raw = el.getAttribute('class');
            return raw ? raw.split(/\\s+/).filter(Boolean) : [];
        }

        function selectorPath(el) {
            var parts = [], node = el;
            while (node && node.nodeType === 1 && node !== document.documentElement) {
                var part = node.tagName.toLowerCase(), parent = node.parentElement;
                if (parent) {
                    var same = [];
                    for (var i = 0; i < parent.children.length; i++) {
                        if (parent.children[i].tagName === node.tagName) same.push(parent.children[i]);
                    }
                    if (same.length > 1) part += ':nth-of-type(' + (same.indexOf(node) + 1) + ')';
                }
                parts.unshift(part);
                node = parent;
            }
            return parts.join('>');
        }

        var marked = document.querySelectorAll('[data-rasterize]');
        var unresolved = [];

        for (var i = 0; i < marked.length; i++) {
            var el = marked[i];
            if (el.getAttribute('data-rz-id')) continue;
            if (unresolved.length < 200) {
                unresolved.push({ tag: el.tagName.toLowerCase(), classes: classesOf(el), selectorPath: selectorPath(el) });
            }
        }

        return { marked: marked.length, resolved: marked.length - unresolved.length, unresolved: unresolved };
    })()`);
}

interface Comparison {
    difference: number;
    delta: RawImage;
}

/** Shared-size difference between two frames, plus a picture of where they disagree. */
function compareFrames(live: RawImage, baked: RawImage): Comparison {
    const width = Math.min(live.width, baked.width);
    const height = Math.min(live.height, baked.height);
    const delta: RawImage = { data: Buffer.alloc(width * height * 4), width, height, channels: 4 };

    let differing = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const a = (y * live.width + x) * 4;
            const b = (y * baked.width + x) * 4;
            const out = (y * width + x) * 4;

            let worst = 0;
            for (let c = 0; c < 4; c++) worst = Math.max(worst, Math.abs(live.data[a + c] - baked.data[b + c]));

            if (worst > CHANNEL_TOLERANCE) {
                differing++;
                // Red where they disagree, brighter the worse it is - readable at a glance.
                delta.data[out] = Math.min(255, 90 + worst);
                delta.data[out + 1] = 20;
                delta.data[out + 2] = 40;
                delta.data[out + 3] = 255;
            } else {
                // Keep a dim copy of the page underneath so the differences have context.
                const grey = Math.round((live.data[a] * 0.2 + live.data[a + 1] * 0.6 + live.data[a + 2] * 0.2) * 0.28);
                delta.data[out] = grey;
                delta.data[out + 1] = grey;
                delta.data[out + 2] = grey;
                delta.data[out + 3] = 255;
            }
        }
    }

    return { difference: width && height ? differing / (width * height) : 0, delta };
}

/** Colour keys down the left edge of each panel, in panel order: live, baked, difference. */
const PANEL_KEYS = [
    [90, 200, 130],
    [90, 150, 230],
    [220, 70, 90],
];

/**
 * Writes the panels as one PNG, stacked along whichever axis keeps them comparable: a game UI
 * viewport is wider than it is tall, and three of those side by side is a picture nobody can
 * read. Stacked, the same x lines up across all three.
 */
async function writePanels(panels: RawImage[], file: string): Promise<void> {
    const gutter = 10;
    const stackVertically = panels[0].width > panels[0].height;

    const width = stackVertically
        ? Math.max(...panels.map((p) => p.width))
        : panels.reduce((sum, p) => sum + p.width, 0) + gutter * (panels.length - 1);
    const height = stackVertically
        ? panels.reduce((sum, p) => sum + p.height, 0) + gutter * (panels.length - 1)
        : Math.max(...panels.map((p) => p.height));

    const canvas = Buffer.alloc(width * height * 4);

    // Opaque dark ground: a transparent PNG viewed on a dark background hides dark differences.
    for (let i = 0; i < canvas.length; i += 4) {
        canvas[i] = 16;
        canvas[i + 1] = 18;
        canvas[i + 2] = 22;
        canvas[i + 3] = 255;
    }

    let offsetX = 0;
    let offsetY = 0;

    panels.forEach((panel, index) => {
        for (let y = 0; y < panel.height; y++) {
            for (let x = 0; x < panel.width; x++) {
                const from = (y * panel.width + x) * 4;
                const to = ((y + offsetY) * width + x + offsetX) * 4;
                const alpha = panel.data[from + 3] / 255;

                // Composite onto the ground so partially transparent captures stay visible.
                for (let c = 0; c < 3; c++) {
                    canvas[to + c] = Math.round(panel.data[from + c] * alpha + canvas[to + c] * (1 - alpha));
                }
                canvas[to + 3] = 255;
            }
        }

        // A colour key, so which panel is which survives being cropped and pasted into a chat.
        const key = PANEL_KEYS[index] ?? [128, 128, 128];
        for (let y = 0; y < panel.height; y++) {
            for (let x = 0; x < 6; x++) {
                const to = ((y + offsetY) * width + x + offsetX) * 4;
                canvas[to] = key[0];
                canvas[to + 1] = key[1];
                canvas[to + 2] = key[2];
                canvas[to + 3] = 255;
            }
        }

        if (stackVertically) offsetY += panel.height + gutter;
        else offsetX += panel.width + gutter;
    });

    await sharp(canvas, { raw: { width, height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toFile(file);
}

export function stripGeneratedTags(html: string): string {
    return html
        .replace(/[ \t]*<link[^>]*rasterize\.css[^>]*>\s*\n?/gi, '')
        .replace(/[ \t]*<script[^>]*rasterize\.js[^>]*><\/script>\s*\n?/gi, '');
}
