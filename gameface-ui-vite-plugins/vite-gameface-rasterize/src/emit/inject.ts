import { promises as fs } from 'node:fs';
import path from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { RUNTIME_ATTR } from '../contract.js';

/** One element-mode asset, and what its subtree has to be reduced to. */
export interface InjectionAsset {
    assetId: string;
    /** Selector list that finds the marked elements - the same one the stylesheet paints through. */
    sel: string;
    /** Child-index paths of the nodes that must survive flattening, in emission order. */
    liveParts: number[][];
    /**
     * True when the selector is a document position rather than a class or an id.
     *
     * A position means something only in the document it was recorded from, so these are applied
     * to that file alone; a class selector describes the element itself and is applied wherever
     * one turns up.
     */
    positional: boolean;
    /** The HTML file this asset was introspected in, relative to the build output. */
    file: string;
}

export interface InjectionResult {
    /** HTML files that were rewritten. */
    files: string[];
    /** How many elements each asset had flattened in the markup. */
    counts: Map<string, number>;
    /**
     * Each rewritten file as it was before flattening, keyed by its path in the output.
     *
     * The audit renders the finished page against "the same page without the bake", and reaches
     * the second by stripping the generated tags out of what shipped. Flattening is a change to
     * the markup, so removing the stylesheet leaves live parts with nothing pinning them and a
     * comparison that reports a difference the shipped page does not have. Keeping the original
     * is what lets the audit still mean something.
     */
    originals: Map<string, string>;
}

/**
 * Flattens element-mode subtrees in the built HTML.
 *
 * Only element mode needs anything done to the markup. A decoration is drawn by a `::before` on
 * the marked element, so it needs no node, no attribute and no script - the stylesheet is the
 * whole delivery mechanism. Flattening is different: it removes wrappers and re-parents the live
 * parts, and CSS can hide a node but cannot delete one.
 *
 * It also cannot be done any earlier than this. The bake's input is the unflattened subtree,
 * because it has to lay that subtree out, photograph it and read each live part's resolved
 * geometry back out of the engine. Flattening before the bake would leave nothing to photograph,
 * which is why this runs after the capture and why a source transform could not do it instead.
 *
 * What it cannot reach is a subtree no file contains, because a framework builds it when the app
 * runs. Those keep the small runtime, and the build says so.
 */
export async function injectFlattening(outDir: string, assets: InjectionAsset[]): Promise<InjectionResult> {
    const result: InjectionResult = {
        files: [],
        counts: new Map(assets.map((a) => [a.assetId, 0])),
        originals: new Map(),
    };

    if (!assets.length) return result;

    for (const file of await findHtml(outDir)) {
        const full = path.join(outDir, file);
        const source = await fs.readFile(full, 'utf8');
        const root = parse(source, { comment: true, blockTextElements: { script: true, style: true, pre: true } });

        let changed = false;

        for (const asset of assets) {
            if (asset.positional && asset.file !== file) continue;

            let found: HTMLElement[];
            try {
                found = root.querySelectorAll(asset.sel);
            } catch {
                // A selector this parser cannot evaluate is a reason to leave the element to the
                // runtime, never a reason to guess which element was meant.
                continue;
            }

            for (const el of found) {
                if (el.getAttribute(RUNTIME_ATTR.id)) continue;
                if (!flattenInPlace(el, asset)) continue;

                el.setAttribute(RUNTIME_ATTR.id, asset.assetId);
                result.counts.set(asset.assetId, (result.counts.get(asset.assetId) ?? 0) + 1);
                changed = true;
            }
        }

        if (!changed) continue;

        result.originals.set(file, source);
        await fs.writeFile(full, root.toString());
        result.files.push(file);
    }

    return result;
}

/**
 * The wrappers are already in the texture, so the subtree is replaced by the live parts alone,
 * each pinned by the stylesheet at the geometry the layout engine gave it. Every path is resolved
 * before anything is written, so a path that points at nothing leaves the element untouched for
 * the runtime rather than half-flattened.
 */
function flattenInPlace(el: HTMLElement, asset: InjectionAsset): boolean {
    const live: HTMLElement[] = [];

    for (const indexes of asset.liveParts) {
        let node: HTMLElement | undefined = el;
        for (const index of indexes) node = node?.children[index];
        if (!node) return false;
        live.push(node);
    }

    live.forEach((node, index) => node.setAttribute(RUNTIME_ATTR.livePart, `${asset.assetId}:${index}`));
    el.set_content(live.map((node) => node.toString()).join(''));

    return true;
}

async function findHtml(dir: string, prefix = ''): Promise<string[]> {
    const found: string[] = [];

    for (const entry of await fs.readdir(path.join(dir, prefix), { withFileTypes: true })) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) found.push(...(await findHtml(dir, rel)));
        else if (entry.name.endsWith('.html')) found.push(rel);
    }

    return found;
}
