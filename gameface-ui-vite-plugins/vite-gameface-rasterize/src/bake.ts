import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Insets } from './contract.js';
import type { PlayerSession } from './capture/session.js';
import type { BakePlan } from './plan.js';
import type { DiagnosticBag } from './diagnostics.js';
import type { IsolateResult, MeasuredLivePart } from './browser/types.js';
import {
    rzApplyState,
    rzBeginIsolation,
    rzClearState,
    rzDecorationSnapshot,
    rzEndIsolation,
    rzPlaceTarget,
} from './browser/isolate.js';
import {
    crop,
    decode,
    encodePng,
    hasInk,
    trimTransparent,
    unpremultiply,
    validateStretchZones,
    type RawImage,
} from './image.js';

export interface BakedState {
    state: string;
    image: RawImage;
}

export interface BakeResult {
    plan: BakePlan;
    /**
     * Element mode: live-part boxes re-measured under isolation, free of the ancestor
     * transforms that were folded into the introspection-time measurement.
     */
    liveParts?: MeasuredLivePart[];
    /** Ink overflow as measured from the trimmed captures, in CSS px. */
    inkOverflow: Insets;
    /** Slice insets in texture pixels, ready for border-image-slice. */
    sliceInsets?: Insets;
    /** The element's border-box size at capture time, in CSS px. */
    cssSize: { w: number; h: number };
    borderWidths: Insets;
    states: BakedState[];
}

/** Extra room around the predicted ink so a soft shadow is never clipped before trimming. */
const SLACK = 12;

/** How much of its own border box a capture must cover before it is treated as clipped. */
const CLIPPED_RATIO = 0.5;

export async function bake(
    session: PlayerSession,
    plan: BakePlan,
    bag: DiagnosticBag,
    debug?: { dir: string }
): Promise<BakeResult | null> {
    const where = plan.mark.authorId || plan.mark.selectorPath;
    const { scale } = plan;

    const ink = plan.inkOverflow;
    const slack = SLACK;

    // The element's border box is placed this far from the viewport origin so that its ink
    // overflow, which extends up and to the left, still lands inside the capturable area.
    const pad = Math.ceil(Math.max(ink.left, ink.top) * scale) + slack * 2;

    const hidePaths = plan.mode === 'element' ? (plan.mark.liveParts ?? []).map((p) => p.path) : [];

    const captures: { state: string; image: RawImage; isolate: IsolateResult }[] = [];
    let baseSnapshot = '';

    for (const state of plan.states) {
        const begun = await session.call(rzBeginIsolation, {
            uid: plan.uid,
            scale,
            pad,
            sizeOverride: plan.mode === 'slice' ? plan.captureSize : null,
            hideContent: plan.mode !== 'element',
            neutralize: plan.neutralize,
            hidePaths,
        });

        // A frame has to pass before the element can be measured: cohtml lays out on its own
        // schedule, so reading its size in the same call would return the pre-isolation box.
        await session.settle();

        const isolate = await session.call(rzPlaceTarget, { uid: plan.uid, scale, pad, measurePaths: hidePaths });
        await session.settle();

        for (const warning of [...begun.warnings, ...isolate.warnings]) bag.add('RZ017', where, warning, plan.route);

        if (begun.wasHidden) {
            bag.add(
                'RZ018',
                where,
                'the element was display:none when the page settled, so it was forced visible to be captured. ' +
                    'Its layout - and any pinned geometry - is what it would be if it were shown at this moment',
                plan.route
            );
        }

        try {
            await applyState(session, plan, state, isolate);
            await session.settle();

            const snapshot = await session.call(rzDecorationSnapshot, plan.uid);
            if (state === 'base') baseSnapshot = snapshot;
            else if (snapshot === baseSnapshot) {
                bag.add('RZ016', where, `state "${state}" resolves to the same decoration as the base bake`, plan.route);
            }

            const clip = {
                x: Math.max(0, Math.floor(isolate.rect.x - ink.left * scale - slack)),
                y: Math.max(0, Math.floor(isolate.rect.y - ink.top * scale - slack)),
                width: Math.ceil(isolate.rect.w + (ink.left + ink.right) * scale + slack * 2),
                height: Math.ceil(isolate.rect.h + (ink.top + ink.bottom) * scale + slack * 2),
            };

            const png = await session.screenshot(clip);
            // Straight alpha from here on: the capture arrives premultiplied and the engine
            // will premultiply the texture again when it loads the PNG.
            const image = unpremultiply(await decode(png));

            captures.push({ state, image, isolate });
        } finally {
            await clearState(session, plan, state, isolate);
            await session.call(rzEndIsolation);
        }
    }

    if (!captures.length) return null;

    // §6.2 step 5: confirm the capture actually contains ink.
    //
    // This has to refuse the bake rather than merely report it. Shipping an empty texture is
    // the worst outcome the pipeline can produce, because the emitted CSS also strips the live
    // decoration - so the element loses its decoration entirely instead of falling back to the
    // CSS that was working. Returning null here leaves the element untouched and live.
    const blank = captures.filter(({ image }) => !hasInk(image));
    if (blank.length === captures.length) {
        bag.add(
            'RZ019',
            where,
            'the capture came back empty, so nothing was baked and the live CSS is left alone. ' +
                'The usual cause on a game HUD is that the element moved between the isolation frame and the ' +
                'capture frame: CSS animations and transitions are stopped for you, JavaScript-driven motion is ' +
                'not. Pause your simulation in the route setup hook - ' +
                `routes: [{ path: '...', setup: 'yourGame.pause()', settleMs: 400 }]. ` +
                'Other causes: the element or an ancestor is transparent or clipped away at capture time, or its ' +
                'decoration is painted by a descendant that element mode would have to bake instead',
            plan.route
        );
        return null;
    }

    if (blank.length) {
        bag.add(
            'RZ019',
            where,
            `state${blank.length > 1 ? 's' : ''} ${blank.map((b) => `"${b.state}"`).join(', ')} captured fully ` +
                'transparent; the base bake is kept and those variants are dropped',
            plan.route
        );
    }

    const usable = captures.filter(({ image }) => hasInk(image));

    // Every state must share one geometry or the stacked underlays would not line up, so the
    // trims are unioned and all states are cropped to the same box.
    const trims = usable.map((c) => trimTransparent(c.image).removed);
    const union: Insets = {
        top: Math.min(...trims.map((t) => t.top)),
        right: Math.min(...trims.map((t) => t.right)),
        bottom: Math.min(...trims.map((t) => t.bottom)),
        left: Math.min(...trims.map((t) => t.left)),
    };

    // What survived the trim tells us how far the ink really reaches. The border box sat `slack`
    // past the predicted overflow inside the untrimmed capture.
    //
    // The margins are snapped outwards to whole CSS pixels first. They become the underlay's
    // negative insets, and a fractional inset puts the texture on a half pixel at runtime - the
    // whole decoration lands half a pixel from where the live CSS drew it. Keeping a little more
    // transparent margin costs nothing; the pixels being kept are transparent by definition.
    const snapped = (side: keyof Insets) => {
        const available = (ink[side] * scale + slack) / scale;
        const raw = (ink[side] * scale + slack - union[side]) / scale;
        const inkPx = Math.min(Math.ceil(raw), Math.floor(available));
        return { inkPx, trim: Math.max(0, Math.round(ink[side] * scale + slack - inkPx * scale)) };
    };

    const sides = { top: snapped('top'), right: snapped('right'), bottom: snapped('bottom'), left: snapped('left') };
    const aligned: Insets = { top: sides.top.trim, right: sides.right.trim, bottom: sides.bottom.trim, left: sides.left.trim };

    const cropped = usable.map((c) => ({
        state: c.state,
        image: crop(
            c.image,
            aligned.left,
            aligned.top,
            Math.max(1, c.image.width - aligned.left - aligned.right),
            Math.max(1, c.image.height - aligned.top - aligned.bottom)
        ),
    }));

    const measuredInk: Insets = {
        top: sides.top.inkPx,
        right: sides.right.inkPx,
        bottom: sides.bottom.inkPx,
        left: sides.left.inkPx,
    };

    // A capture can contain ink and still be wrong: an element under a clipping or transformed
    // ancestor comes back as a sliver of its decoration - 21x3 where 21x21 was expected - which
    // passes an is-it-empty test and ships as an invisible asset. That is the last fully silent
    // failure in the pipeline, so a capture that does not cover most of its own border box is
    // refused the same way an empty one is.
    const expected = { w: plan.captureSize.w * scale, h: plan.captureSize.h * scale };
    const clipped = cropped.find(
        ({ image }) => image.width < expected.w * CLIPPED_RATIO || image.height < expected.h * CLIPPED_RATIO
    );

    if (clipped) {
        bag.add(
            'RZ019',
            where,
            `the capture is clipped, not tight: expected about ${Math.round(expected.w)}x${Math.round(expected.h)} ` +
                `texture pixels for this element, got ${clipped.image.width}x${clipped.image.height}. ` +
                'Something above it is clipping or transforming it out of the captured area. Nothing was baked ' +
                'and the live CSS is left alone',
            plan.route
        );
        return null;
    }

    const isolate = usable[0].isolate;
    let sliceInsets: Insets | undefined;

    if (debug) {
        await fs.mkdir(debug.dir, { recursive: true });
        for (const { state, image } of cropped) {
            await fs.writeFile(path.join(debug.dir, `${plan.assetId}.${state}.png`), await encodePng(image));
        }
        await fs.writeFile(
            path.join(debug.dir, `${plan.assetId}.json`),
            JSON.stringify({ plan: { ...plan, mark: undefined }, measuredInk, union, trims, isolate }, null, 2)
        );
    }

    if (plan.mode === 'slice' && plan.cornerBox) {
        sliceInsets = {
            top: Math.round((measuredInk.top + plan.cornerBox.top) * scale),
            right: Math.round((measuredInk.right + plan.cornerBox.right) * scale),
            bottom: Math.round((measuredInk.bottom + plan.cornerBox.bottom) * scale),
            left: Math.round((measuredInk.left + plan.cornerBox.left) * scale),
        };

        for (const { state, image } of cropped) {
            const report = validateStretchZones(image, sliceInsets);
            if (!report.ok) {
                bag.add(
                    'RZ005',
                    where,
                    `${report.where} varies by ${report.worst}/255 along its stretch axis` +
                        `${state === 'base' ? '' : ` (state "${state}")`}. A decoration that changes along ` +
                        'the axis it would be stretched on cannot be 9-sliced - a gradient fill is the usual ' +
                        'cause. Give the element a fixed size and data-rasterize-mode="flat", or make the fill uniform',
                    plan.route
                );
                return null;
            }
        }
    }

    return {
        plan,
        liveParts: isolate.liveParts,
        inkOverflow: measuredInk,
        sliceInsets,
        cssSize: isolate.cssSize,
        borderWidths: isolate.borderWidths,
        states: cropped,
    };
}

/**
 * Turns a state variant on. hover and active go through real mouse input: the Player accepts
 * `CSS.forcePseudoState` and then does nothing with it, so synthetic pseudo-classes are not
 * an option on this engine.
 */
async function applyState(session: PlayerSession, plan: BakePlan, state: string, isolate: IsolateResult): Promise<void> {
    if (state === 'base') return;

    // Aimed at where the element is drawn. Hit-testing follows the transform even though
    // getBoundingClientRect does not report it, so this is the position the pointer needs.
    const centre = {
        x: Math.round(isolate.rect.x + isolate.rect.w / 2),
        y: Math.round(isolate.rect.y + isolate.rect.h / 2),
    };

    if (state === 'hover') {
        await session.mouseMove(centre.x, centre.y);
        return;
    }

    if (state === 'active') {
        await session.mouseMove(centre.x, centre.y);
        await session.mouseDown(centre.x, centre.y);
        return;
    }

    await session.call(rzApplyState, { uid: plan.uid, state });
}

async function clearState(session: PlayerSession, plan: BakePlan, state: string, isolate?: IsolateResult): Promise<void> {
    if (state === 'base') return;

    if (state === 'hover' || state === 'active') {
        if (state === 'active' && isolate) {
            await session.mouseUp(Math.round(isolate.rect.x + isolate.rect.w / 2), Math.round(isolate.rect.y + isolate.rect.h / 2));
        }
        // Park the pointer far away so the next bake does not start out hovered.
        await session.mouseMove(-1, -1);
        return;
    }

    await session.call(rzClearState, { uid: plan.uid, state });
}

