import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
    CONTRACT_VERSION,
    type AssetEntry,
    type AssetMatcher,
    type RasterizeManifest,
    type StateAsset,
} from '../contract.js';
import type { BakeResult } from '../bake.js';
import type { ResolvedOptions } from '../config.js';
import { CODES, type DiagnosticBag } from '../diagnostics.js';
import type { AdvisorGroup } from './report.js';
import { encodePng, encodeWebp, imageDigest, needsAlpha, vramBytes } from '../image.js';
import { emitStylesheet } from './css.js';
import { buildRuntime, type RuntimeAsset, type RuntimePayload } from './runtime.js';

export interface WriteResult {
    manifest: RasterizeManifest;
    stylesheetPath: string;
    runtimePath: string;
    patchedHtml: string[];
}

const STYLESHEET = 'rasterize.css';
const RUNTIME = 'rasterize.js';
const MANIFEST = 'rasterize.manifest.json';

/**
 * Writes every artefact of the bake: the textures, the stylesheet that positions them, the
 * runtime that attaches them, the manifest, and the two tags in each HTML entry that pull
 * the first two in.
 */
export async function writeOutput(
    results: BakeResult[],
    options: ResolvedOptions,
    engineVersion: string,
    bag: DiagnosticBag,
    outDir: string,
    routes: string[]
): Promise<WriteResult> {
    const assetDir = path.join(outDir, options.outDir);
    await fs.mkdir(assetDir, { recursive: true });

    const assets: Record<string, AssetEntry> = {};
    const matchers: AssetMatcher[] = [];
    const runtimeAssets: Record<string, RuntimeAsset> = {};
    const ancestries = new Map<string, { tag: string; classes: string[] }[]>();
    const digests = new Map<string, string[]>();

    let totalVram = 0;
    let removedNodes = 0;

    for (const result of results) {
        const { plan } = result;
        const states: Record<string, StateAsset> = {};

        for (const { state, image } of result.states) {
            const base = `${plan.assetId}.${state}`;
            const png = await encodePng(image);
            await fs.writeFile(path.join(assetDir, `${base}.png`), png);

            // One decoration baked under many ids shows up here as the same bytes twice.
            if (state === 'base') {
                const digest = imageDigest(png);
                digests.set(digest, [...(digests.get(digest) ?? []), plan.assetId]);
            }

            const entry: StateAsset = {
                src: `${options.outDir}${base}.png`,
                w: image.width,
                h: image.height,
                bytes: png.length,
                vramEstBytes: vramBytes(image.width, image.height),
            };

            if (options.transcode === 'webp') {
                const webp = await encodeWebp(image);
                await fs.writeFile(path.join(assetDir, `${base}.webp`), webp);
                entry.webp = `${options.outDir}${base}.webp`;
            } else if (options.transcode && needsAlpha(image)) {
                bag.add('RZ009', plan.assetId, `${options.transcode} cannot carry this asset's soft alpha`, plan.route);
            }

            totalVram += entry.vramEstBytes;
            states[state] = entry;
        }

        const liveParts = plan.mode === 'element' ? (plan.mark.liveParts ?? []).filter((p) => !p.nestedMarker) : undefined;
        const removed = plan.mode === 'element' ? Math.max(0, (plan.mark.subtreeNodeCount ?? 0) - (liveParts?.length ?? 0)) : 0;
        removedNodes += removed;

        assets[plan.assetId] = {
            mode: plan.mode,
            strippedProperties: plan.strippedProperties,
            inkOverflow: result.inkOverflow,
            sliceInsets: result.sliceInsets,
            captureSize: result.cssSize,
            borderWidths: result.borderWidths,
            position: plan.mark.style.position,
            bakeScale: plan.scale,
            states,
            // Geometry comes from the isolated measurement where available: the boxes recorded
            // during introspection still carry whatever ancestor transform was in force.
            liveParts: liveParts?.map((part, index) => ({
                path: part.path,
                reason: part.reason,
                detail: part.detail,
                box: result.liveParts?.[index]?.resolved ? result.liveParts[index].box : part.box,
                units: 'px' as const,
            })),
            removedNodes: plan.mode === 'element' ? removed : undefined,
            frozenVariables: Object.keys(plan.frozenVariables).length ? plan.frozenVariables : undefined,
            hash: plan.hash,
            diagnostics: [...new Set(bag.forElement(plan.mark.authorId || plan.mark.selectorPath).map((d) => d.code))],
        };

        matchers.push({
            assetId: plan.assetId,
            tag: plan.mark.tag,
            classes: plan.mark.classes,
            authorId: plan.mark.authorId ?? undefined,
            selectorPath: plan.mark.selectorPath,
        });

        ancestries.set(plan.assetId, plan.mark.ancestry ?? []);

        runtimeAssets[plan.assetId] = {
            mode: plan.mode,
            states: result.states.map((s) => s.state),
            liveParts: liveParts?.map((p) => p.path),
            nineDiv: plan.mode === 'slice' && options.sliceImpl === 'divs',
        };
    }

    disambiguate(matchers, ancestries, bag);
    reportDuplicateImages(digests, assets, bag);

    const budgetBytes = options.textureBudgetMB * 1024 * 1024;
    if (totalVram > budgetBytes) {
        const worst = Object.entries(assets)
            .map(([id, asset]) => [id, Object.values(asset.states).reduce((sum, s) => sum + s.vramEstBytes, 0)] as const)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id, bytes]) => `${id} (${mb(bytes)})`);

        bag.add(
            'RZ006',
            'build',
            `${mb(totalVram)} of texture against a ${options.textureBudgetMB} MB budget; largest: ${worst.join(', ')}`
        );
    }

    const manifest: RasterizeManifest = {
        contractVersion: CONTRACT_VERSION,
        engineVersion,
        bakeScale: options.bakeScale,
        generatedFrom: routes,
        assets,
        matchers,
        totals: { vramEstBytes: totalVram, budgetBytes, assetCount: results.length, removedNodes },
    };

    const stylesheet = emitStylesheet(manifest, { assetDir: './', sliceImpl: options.sliceImpl });
    const payload: RuntimePayload = { assets: runtimeAssets, matchers };

    await fs.writeFile(path.join(assetDir, STYLESHEET), stylesheet);
    await fs.writeFile(path.join(assetDir, RUNTIME), buildRuntime(payload));
    await fs.writeFile(path.join(assetDir, MANIFEST), JSON.stringify(manifest, null, 2));

    const patchedHtml = await patchHtmlFiles(outDir, options.outDir);

    return {
        manifest,
        stylesheetPath: path.join(options.outDir, STYLESHEET),
        runtimePath: path.join(options.outDir, RUNTIME),
        patchedHtml,
    };
}

/**
 * Two elements with the same tag and classes normally share a texture, which is the point -
 * twenty identical cards cost one bake. When they baked *differently*, the runtime needs
 * something else to tell them apart.
 *
 * The common shape is a variant selected through an ancestor (`.wm--hostile .wm__frame`), where
 * every marked element presents an identical tag and class list. For those, the nearest ancestor
 * class that no other bake in the group has is recorded, and the runtime resolves by walking up
 * from the element. Only when nothing separates them does a matcher fall back to document
 * position - which by definition can match one element and leaves its twins on live CSS.
 */
function disambiguate(
    matchers: AssetMatcher[],
    ancestries: Map<string, { tag: string; classes: string[] }[]>,
    bag: DiagnosticBag
): void {
    const byKey = new Map<string, AssetMatcher[]>();

    for (const matcher of matchers) {
        const key = `${matcher.tag}|${[...matcher.classes].sort().join('.')}`;
        const bucket = byKey.get(key) ?? [];
        bucket.push(matcher);
        byKey.set(key, bucket);
    }

    for (const bucket of byKey.values()) {
        if (new Set(bucket.map((m) => m.assetId)).size <= 1) continue;

        for (const matcher of bucket) {
            const mine = ancestries.get(matcher.assetId) ?? [];
            const theirs = bucket
                .filter((other) => other.assetId !== matcher.assetId)
                .map((other) => new Set((ancestries.get(other.assetId) ?? []).flatMap((a) => a.classes)));

            // Nearest ancestor first: the closest qualifier is the one least likely to also be
            // true of some unrelated element elsewhere in the page.
            let found: string | undefined;
            for (const level of mine) {
                found = level.classes.find((token) => theirs.every((other) => !other.has(token)));
                if (found) break;
            }

            if (found) {
                matcher.ancestorClass = found;
            } else {
                matcher.ambiguous = true;
                bag.add(
                    'RZ020',
                    matcher.assetId,
                    `<${matcher.tag}${matcher.classes.map((c) => `.${c}`).join('')}> bakes differently from ` +
                        `${bucket.length - 1} other element${bucket.length > 2 ? 's' : ''} with the same tag and classes, ` +
                        'and no ancestor class separates them. Only the element at its recorded position will get a ' +
                        'texture; its twins keep live CSS. Put the variant on the marked element itself'
                );
            }
        }
    }
}

/**
 * Byte-identical textures under different ids mean the bake key split something that renders the
 * same. The key is the decoration values, the size, the scale and the states - so naming which of
 * those differs turns "159 assets for 50 decorations" from a number you have to notice into a
 * sentence that says what to change.
 */
function reportDuplicateImages(
    digests: Map<string, string[]>,
    assets: Record<string, AssetEntry>,
    bag: DiagnosticBag
): void {
    for (const ids of digests.values()) {
        if (ids.length < 2) continue;

        const [first, ...rest] = ids;
        const a = assets[first];
        const differing = new Set<string>();

        for (const id of rest) {
            const b = assets[id];
            if (!a || !b) continue;
            if (a.captureSize.w !== b.captureSize.w || a.captureSize.h !== b.captureSize.h) differing.add('measured size');
            if (a.bakeScale !== b.bakeScale) differing.add('bake scale');
            if (JSON.stringify(a.inkOverflow) !== JSON.stringify(b.inkOverflow)) differing.add('ink overflow');
            if (JSON.stringify(a.sliceInsets) !== JSON.stringify(b.sliceInsets)) differing.add('slice insets');
            if (a.mode !== b.mode) differing.add('mode');
        }

        const cause = differing.size
            ? `their ${[...differing].join(' and ')} differ`
            : 'nothing in the bake key differs, which should not happen';

        const hint = differing.has('measured size')
            ? '. A per-element transform on the elements or an ancestor changes the measured size, ' +
              'which is part of the key - quantise or share it and they collapse to one texture'
            : '';

        bag.add(
            'RZ021',
            first,
            `${ids.length} assets are byte-identical images (${ids.join(', ')}); ${cause}${hint}`
        );
    }
}

export interface DiagnosticsFile {
    engineVersion: string;
    counts: Record<string, number>;
    diagnostics: {
        code: string;
        level: string;
        message: string;
        detail?: string;
        docs: string;
        route?: string;
        elements: string[];
    }[];
    advisor: { tag: string; classes: string[]; properties: string[]; count: number; examples: string[] }[];
    coverage: { route: string; marked: number; resolved: number; unresolved: unknown[] }[];
}

/**
 * Writes every diagnostic, in full, as data.
 *
 * The console is for reading and the file is for working from: the checks that matter most here
 * produce long lists - every element that missed a texture, every unmarked element worth marking -
 * and a list you cannot get at in full is a dead end at exactly the moment you need it.
 */
export async function writeDiagnostics(
    outDir: string,
    assetDir: string,
    engineVersion: string,
    bag: DiagnosticBag,
    advisor: AdvisorGroup[],
    coverage: { route: string; marked: number; resolved: number; unresolved: unknown[] }[]
): Promise<string> {
    const counts: Record<string, number> = {};
    for (const item of bag.items) counts[item.level] = (counts[item.level] ?? 0) + item.count;

    const file: DiagnosticsFile = {
        engineVersion,
        counts,
        diagnostics: bag.items.map((item) => ({
            code: item.code,
            level: item.level,
            message: CODES[item.code].message,
            detail: item.detail,
            docs: CODES[item.code].docs,
            route: item.route,
            elements: [item.where, ...item.others],
        })),
        advisor: advisor.map((group) => ({
            tag: group.tag,
            classes: group.classes,
            properties: group.properties,
            count: group.count,
            examples: group.examples,
        })),
        coverage,
    };

    const target = path.join(outDir, assetDir, 'rasterize.diagnostics.json');
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(file, null, 2));

    return path.join(assetDir, 'rasterize.diagnostics.json').replace(/\\/g, '/');
}

/** Adds the stylesheet and runtime to every HTML entry in the build output. */
async function patchHtmlFiles(outDir: string, assetDir: string): Promise<string[]> {
    const patched: string[] = [];

    for (const file of await findHtml(outDir)) {
        const html = await fs.readFile(file, 'utf8');
        if (html.includes(STYLESHEET)) continue;

        const prefix = path.relative(path.dirname(file), path.join(outDir, assetDir)).replace(/\\/g, '/');
        const base = prefix ? `${prefix}/` : '';

        const link = `<link rel="stylesheet" href="${base}${STYLESHEET}">`;
        const script = `<script src="${base}${RUNTIME}"></script>`;

        let updated = html.includes('</head>')
            ? html.replace('</head>', `    ${link}\n</head>`)
            : `${link}\n${html}`;

        updated = updated.includes('</body>')
            ? updated.replace('</body>', `    ${script}\n</body>`)
            : `${updated}\n${script}`;

        await fs.writeFile(file, updated);
        patched.push(path.relative(outDir, file));
    }

    return patched;
}

async function findHtml(dir: string): Promise<string[]> {
    const found: string[] = [];

    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) found.push(...(await findHtml(full)));
        else if (entry.name.endsWith('.html')) found.push(full);
    }

    return found;
}

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
