import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Insets } from './contract.js';
import type { MeasuredLivePart } from './browser/types.js';
import { decode, encodePng, type RawImage } from './image.js';
import type { BakeResult } from './bake.js';
import type { BakePlan } from './plan.js';

interface CachedMeta {
    inkOverflow: Insets;
    sliceInsets?: Insets;
    cssSize: { w: number; h: number };
    borderWidths: Insets;
    states: string[];
    liveParts?: MeasuredLivePart[];
}

/**
 * Content-addressed bake cache.
 *
 * The key already covers the decoration values, the canonical size, the scale, the state
 * list, the engine version and the contract version, so a hit means the Player would draw
 * exactly the same pixels - which is what makes skipping the capture safe. A new engine
 * build changes the key, because a renderer change is a repaint.
 */
export class BakeCache {
    constructor(private readonly root: string) {}

    private dirFor(hash: string): string {
        return path.join(this.root, hash);
    }

    async read(plan: BakePlan): Promise<BakeResult | null> {
        const dir = this.dirFor(plan.hash);

        try {
            const meta: CachedMeta = JSON.parse(await fs.readFile(path.join(dir, 'meta.json'), 'utf8'));
            const states: { state: string; image: RawImage }[] = [];

            for (const state of meta.states) {
                const png = await fs.readFile(path.join(dir, `${state}.png`));
                states.push({ state, image: await decode(png) });
            }

            return {
                plan,
                liveParts: meta.liveParts,
                inkOverflow: meta.inkOverflow,
                sliceInsets: meta.sliceInsets,
                cssSize: meta.cssSize,
                borderWidths: meta.borderWidths,
                states,
            };
        } catch {
            return null;
        }
    }

    async write(result: BakeResult): Promise<void> {
        const dir = this.dirFor(result.plan.hash);
        await fs.mkdir(dir, { recursive: true });

        const meta: CachedMeta = {
            liveParts: result.liveParts,
            inkOverflow: result.inkOverflow,
            sliceInsets: result.sliceInsets,
            cssSize: result.cssSize,
            borderWidths: result.borderWidths,
            states: result.states.map((s) => s.state),
        };

        await fs.writeFile(path.join(dir, 'meta.json'), JSON.stringify(meta));

        for (const { state, image } of result.states) {
            await fs.writeFile(path.join(dir, `${state}.png`), await encodePng(image));
        }
    }
}
