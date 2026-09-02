import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ATTR, type RasterizeManifest } from './contract.js';
import type { ResolvedOptions, RasterizeRoute } from './config.js';
import { DiagnosticBag } from './diagnostics.js';
import { closePlayer, findFreePort, launchPlayer } from './capture/player.js';
import { PlayerSession } from './capture/session.js';
import { serveDirectory } from './capture/server.js';
import { stripGeneratedTags } from './audit.js';
import { rzIntrospect } from './browser/introspect.js';
import { rzBeginIsolation, rzEndIsolation, rzPlaceTarget } from './browser/isolate.js';
import { compare, decode, writeDiff, type RawImage } from './image.js';

export interface VerifyOptions {
    outDir: string;
    options: ResolvedOptions;
    /** Where side-by-side diffs for failures are written. */
    reportDir: string;
    /** Also write a machine-readable summary here. */
    jsonPath?: string;
    log?: (message: string) => void;
}

export interface Comparison {
    assetId: string;
    route: string;
    size: string;
    ssim: number;
    maxPixelDelta: number;
    passed: boolean;
    /** The two renders differ only where both are fully transparent. */
    alphaOnly?: boolean;
    /** Set when the captures came back different sizes, which is a fault in itself. */
    sizeMismatch?: string;
    diff?: string;
}

export interface VerifyOutcome {
    checked: number;
    comparisons: Comparison[];
    failures: Comparison[];
    bag: DiagnosticBag;
    report: string;
}

/** One capture of one asset at one size, held until its counterpart from the other page arrives. */
interface Shot {
    assetId: string;
    size: { w: number; h: number };
    label: string;
    image: RawImage;
}

/**
 * Renders every baked asset twice in the Player - once with the bake active, once with the
 * generated tags stripped from the page - and compares them.
 *
 * The work is per unique asset, not per element that uses one: a page with sixty cards sharing a
 * texture asks one question, not sixty. And each page is loaded exactly once per route, with every
 * capture taken while it is up, because the page loads were what made this unusable at scale.
 */
export async function verify(input: VerifyOptions): Promise<VerifyOutcome> {
    const { options, outDir } = input;
    const log = input.log ?? (() => {});
    const bag = new DiagnosticBag(options.strictTransitions);

    const manifestPath = path.join(outDir, options.outDir, 'rasterize.manifest.json');
    const manifest: RasterizeManifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

    await fs.mkdir(input.reportDir, { recursive: true });

    const server = await serveDirectory(outDir);
    const referenceServer = await serveDirectory(outDir, { transformHtml: stripGeneratedTags });

    const port = await findFreePort(options.port + 10);
    const player = await launchPlayer({
        executablePath: options.playerPath,
        port,
        url: `${server.origin}/${options.routes[0].path}`,
        width: options.viewport.width,
        height: options.viewport.height,
        headed: options.headed,
        cwd: path.resolve(options.cacheDir, 'player-verify'),
    });

    const session = await PlayerSession.connect(port);
    const comparisons: Comparison[] = [];

    try {
        for (const route of options.routes) {
            // Pass one: the shipped page. Every asset present on this route is captured while it
            // is loaded, and the element carrying each one is remembered by position so the same
            // element can be found again in the reference page.
            await load(session, `${server.origin}/${route.path}`, route);
            const targets = await findAssets(session);
            if (!targets.length) continue;

            log(`${route.path}: ${targets.length} unique asset${targets.length === 1 ? '' : 's'} to check`);

            const baked = await captureAll(session, targets, manifest, true);

            // Pass two: the same page without the bake.
            await load(session, `${referenceServer.origin}/${route.path}`, route);
            const referenceTargets = await matchByPath(session, targets);
            const live = await captureAll(session, referenceTargets, manifest, false);

            for (const shot of baked) {
                const counterpart = live.find((l) => l.assetId === shot.assetId && l.label === shot.label);
                if (!counterpart) continue;

                const result = compare(counterpart.image, shot.image);

                // A difference nobody can see is not a difference. Fully transparent pixels carry
                // whatever RGB the renderer left behind, and comparing those bytes used to be
                // enough on its own to fail an asset that looks identical.
                const passed =
                    result.alphaOnlyDifference || (result.ssim >= options.ssimThreshold && result.maxPixelDelta <= 32);

                const comparison: Comparison = {
                    assetId: shot.assetId,
                    route: route.path,
                    size: shot.label,
                    ssim: +result.ssim.toFixed(4),
                    maxPixelDelta: result.maxPixelDelta,
                    passed,
                    alphaOnly: result.alphaOnlyDifference,
                    sizeMismatch: result.sizeMismatch,
                };

                if (!passed) {
                    const diff = path.join(input.reportDir, `${shot.assetId}.${shot.label}.diff.png`);
                    await writeDiff(counterpart.image, shot.image, diff);
                    comparison.diff = diff;
                    bag.add(
                        'RZ008',
                        shot.assetId,
                        `SSIM ${result.ssim.toFixed(4)} at ${shot.label} (threshold ${options.ssimThreshold}), ` +
                            `worst visible delta ${result.maxPixelDelta} over ${result.differingPixels} pixels` +
                            `${result.sizeMismatch ? `, sizes ${result.sizeMismatch}` : ''}; diff at ${diff}`,
                        route.path
                    );
                } else if (result.alphaOnlyDifference) {
                    log(
                        `  ${shot.assetId} @ ${shot.label}: identical where visible ` +
                            `(${result.differingPixels} differing pixels are transparent in both)`
                    );
                } else {
                    log(`  ${shot.assetId} @ ${shot.label}: SSIM ${result.ssim.toFixed(4)}`);
                }

                comparisons.push(comparison);
            }
        }
    } finally {
        await session.close();
        await closePlayer(player);
        await server.close();
        await referenceServer.close();
    }

    const failures = comparisons.filter((c) => !c.passed);

    if (input.jsonPath) {
        await fs.mkdir(path.dirname(input.jsonPath), { recursive: true });
        await fs.writeFile(
            input.jsonPath,
            JSON.stringify(
                {
                    engineVersion: manifest.engineVersion,
                    ssimThreshold: options.ssimThreshold,
                    checked: comparisons.length,
                    failed: failures.length,
                    comparisons,
                },
                null,
                2
            )
        );
    }

    return {
        checked: comparisons.length,
        comparisons,
        failures,
        bag,
        report: formatVerifyReport(comparisons, failures, options.ssimThreshold, input.jsonPath),
    };
}

interface Target {
    assetId: string;
    uid: number;
    selectorPath: string;
}

async function load(session: PlayerSession, url: string, route: RasterizeRoute): Promise<void> {
    await session.goto(url, route.settleMs ?? 250);

    if (route.setup) {
        await session.evaluateRaw(`(async () => { ${route.setup} })()`);
        await session.settle(route.settleMs ?? 250);
    }

    await session.call(rzIntrospect, {
        attrs: { mark: ATTR.mark, mode: ATTR.mode, states: ATTR.states, id: ATTR.id, scale: ATTR.scale, live: ATTR.live },
        interactiveTags: [],
        advisor: false,
        advisorLimit: 0,
    });
}

/** One element per unique asset: sixty cards sharing a texture are one question, not sixty. */
async function findAssets(session: PlayerSession): Promise<Target[]> {
    return session.evaluateRaw<Target[]>(`(function () {
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

        var seen = {}, out = [];
        var marked = document.querySelectorAll('[data-rz-uid]');

        for (var i = 0; i < marked.length; i++) {
            var el = marked[i];
            var assetId = el.getAttribute('data-rz-id');
            if (!assetId || seen[assetId]) continue;
            seen[assetId] = true;
            out.push({ assetId: assetId, uid: parseInt(el.getAttribute('data-rz-uid'), 10), selectorPath: selectorPath(el) });
        }

        return out;
    })()`);
}

/** Finds the same elements in the reference page, where nothing has been stamped with an id. */
async function matchByPath(session: PlayerSession, targets: Target[]): Promise<Target[]> {
    const paths = targets.map((t) => ({ assetId: t.assetId, selectorPath: t.selectorPath }));

    return session.evaluateRaw<Target[]>(`(function (wanted) {
        var out = [];
        var marked = document.querySelectorAll('[data-rz-uid]');
        var byPath = {};

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

        for (var i = 0; i < marked.length; i++) byPath[selectorPath(marked[i])] = marked[i];

        for (var j = 0; j < wanted.length; j++) {
            var el = byPath[wanted[j].selectorPath];
            if (!el) continue;
            out.push({
                assetId: wanted[j].assetId,
                uid: parseInt(el.getAttribute('data-rz-uid'), 10),
                selectorPath: wanted[j].selectorPath,
            });
        }

        return out;
    })(${JSON.stringify(paths)})`);
}

/** Captures every asset at every size it should be checked at, without reloading the page. */
async function captureAll(
    session: PlayerSession,
    targets: Target[],
    manifest: RasterizeManifest,
    keepUnderlays: boolean
): Promise<Shot[]> {
    const shots: Shot[] = [];

    for (const target of targets) {
        const asset = manifest.assets[target.assetId];
        if (!asset) continue;

        const livePaths = asset.mode === 'element' ? (asset.liveParts ?? []).map((p) => p.path) : [];

        for (const size of sizesToCheck(asset.mode, asset.captureSize)) {
            const image = await captureIsolated(session, target.uid, asset.bakeScale, size, {
                keepUnderlays,
                hideContent: keepUnderlays || asset.mode !== 'element',
                hidePaths: keepUnderlays ? [] : livePaths,
            });

            shots.push({ assetId: target.assetId, size, label: `${Math.round(size.w)}x${Math.round(size.h)}`, image });
        }
    }

    return shots;
}

async function captureIsolated(
    session: PlayerSession,
    uid: number,
    scale: number,
    size: { w: number; h: number },
    how: { keepUnderlays: boolean; hideContent: boolean; hidePaths: number[][] }
): Promise<RawImage> {
    const pad = 96;

    await session.call(rzBeginIsolation, {
        uid,
        scale,
        pad,
        sizeOverride: size,
        hideContent: how.hideContent,
        neutralize: [],
        hidePaths: how.hidePaths,
        keepUnderlays: how.keepUnderlays,
    });

    try {
        // The frame between isolating and placing is what makes the measurement real.
        await session.settle();
        const isolate = await session.call(rzPlaceTarget, { uid, scale, pad });
        await session.settle();

        // Deliberately untrimmed. Both captures use the same placement and the same clip, so they
        // are aligned by construction; trimming each to its own ink re-introduced a size
        // difference of a pixel or two - which the comparison then reported as a total failure -
        // and it also hid the very thing this is meant to catch, an underlay in the wrong place.
        const png = await session.screenshot({
            x: Math.max(0, Math.floor(isolate.rect.x - pad / 2)),
            y: Math.max(0, Math.floor(isolate.rect.y - pad / 2)),
            width: Math.ceil(isolate.rect.w + pad),
            height: Math.ceil(isolate.rect.h + pad),
        });

        return decode(png);
    } finally {
        await session.call(rzEndIsolation);
    }
}

/** Slice assets are checked stretched, since stretching is where a 9-slice fails. */
function sizesToCheck(mode: string, captureSize: { w: number; h: number }): { w: number; h: number }[] {
    if (mode !== 'slice') return [captureSize];

    return [
        captureSize,
        { w: Math.round(captureSize.w * 1.5), h: Math.round(captureSize.h * 1.5) },
        { w: Math.round(captureSize.w * 2.4), h: Math.round(captureSize.h * 1.1) },
    ];
}

function formatVerifyReport(
    comparisons: Comparison[],
    failures: Comparison[],
    threshold: number,
    jsonPath?: string
): string {
    const lines = [
        '',
        `rasterize verify - ${comparisons.length} comparison${comparisons.length === 1 ? '' : 's'} over ` +
            `${new Set(comparisons.map((c) => c.assetId)).size} assets, threshold SSIM ${threshold}`,
        '',
    ];

    if (!failures.length) {
        lines.push('  every baked asset matches its live CSS');
    } else {
        // A whole run failing with identical extreme numbers is a fault in the comparison, not
        // one regression per asset, and saying so is the difference between fixing the tool and
        // removing it.
        const sentinel = failures.filter((f) => f.ssim === 0 && f.maxPixelDelta === 255);
        if (sentinel.length >= 3 && sentinel.length === failures.length) {
            lines.push(
                `  ${sentinel.length} assets scored exactly 0.0000 with a max delta of exactly 255.`,
                '  That pattern is a comparison fault rather than that many independent regressions -',
                '  look at a diff image before acting on it.',
                ''
            );
        }

        const mismatched = failures.filter((f) => f.sizeMismatch);
        if (mismatched.length) {
            lines.push(
                `  ${mismatched.length} of them came back as different-sized captures, which is itself the fault:`,
                `  e.g. ${mismatched[0].assetId} ${mismatched[0].sizeMismatch}.`,
                ''
            );
        }

        for (const failure of failures) {
            lines.push(
                `  FAIL ${failure.assetId} @ ${failure.size}: SSIM ${failure.ssim.toFixed(4)}, ` +
                    `worst visible delta ${failure.maxPixelDelta}` +
                    `${failure.sizeMismatch ? `, sizes ${failure.sizeMismatch}` : ''}`
            );
            if (failure.diff) lines.push(`       ${failure.diff}`);
        }
    }

    if (jsonPath) lines.push('', `  summary written to ${jsonPath}`);

    lines.push('');
    return lines.join('\n');
}
