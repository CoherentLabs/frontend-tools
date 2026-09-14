import { createHash } from 'node:crypto';
import { CONTRACT_VERSION, PSEUDO_STATES, type Insets, type ResolvedMode } from './contract.js';
import type { DiagnosticBag } from './diagnostics.js';
import type { MatchedRule } from './capture/session.js';
import type { RawMark } from './browser/types.js';
import type { ResolvedOptions } from './config.js';

export interface ShadowSpec {
    inset: boolean;
    dx: number;
    dy: number;
    blur: number;
    spread: number;
}

export interface BakePlan {
    assetId: string;
    uid: number;
    mark: RawMark;
    mode: ResolvedMode;
    scale: number;
    /** How far ink extends past the border box, per side, in CSS px. */
    inkOverflow: Insets;
    /** Border-box size to capture at, in CSS px. Equals the runtime size except in slice mode. */
    captureSize: { w: number; h: number };
    /** Slice mode: how far the non-uniform pixels reach into the border box from each edge. */
    cornerBox?: Insets;
    /** Base plus any state variants. */
    states: string[];
    strippedProperties: string[];
    /** Properties set to none on the target during capture because they stay live. */
    neutralize: string[];
    frozenVariables: Record<string, string>;
    hash: string;
    route: string;
}

/** Splits a comma-separated CSS value without cutting inside rgba(...) or gradients. */
export function splitTopLevel(value: string, separator = ','): string[] {
    const parts: string[] = [];
    let depth = 0;
    let current = '';

    for (const ch of value) {
        if (ch === '(') depth++;
        else if (ch === ')') depth--;

        if (ch === separator && depth === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }

    if (current.trim()) parts.push(current.trim());
    return parts;
}

const COLOR_PATTERN = /(?:rgba?|hsla?)\([^)]*\)|#[0-9a-f]{3,8}\b|\b(?:transparent|currentcolor|[a-z]{3,20})\b/gi;

/**
 * Parses a computed `box-shadow`. cohtml emits lengths first and the colour last with
 * `inset` trailing, but colour-first is legal CSS too, so both are tolerated: the colour is
 * removed and whatever lengths remain are read in order.
 */
export function parseBoxShadow(value: string): ShadowSpec[] {
    if (!value || value === 'none') return [];

    return splitTopLevel(value)
        .map((part) => {
            const inset = /\binset\b/.test(part);
            const lengths = part
                .replace(COLOR_PATTERN, ' ')
                .replace(/\binset\b/g, ' ')
                .trim()
                .split(/\s+/)
                .map(parseFloat)
                .filter((n) => !isNaN(n));

            if (lengths.length < 2) return null;

            return {
                inset,
                dx: lengths[0] ?? 0,
                dy: lengths[1] ?? 0,
                blur: lengths[2] ?? 0,
                spread: lengths[3] ?? 0,
            };
        })
        .filter((s): s is ShadowSpec => s !== null);
}

export interface FilterExtent {
    blur: number;
    dropShadows: ShadowSpec[];
    /** Functions present that neither move nor spread ink (brightness, saturate, ...). */
    colorOnly: string[];
}

export function parseFilter(value: string): FilterExtent {
    const result: FilterExtent = { blur: 0, dropShadows: [], colorOnly: [] };
    if (!value || value === 'none') return result;

    const functions = value.match(/[a-z-]+\([^)]*\)/gi) ?? [];

    for (const fn of functions) {
        const name = fn.slice(0, fn.indexOf('(')).toLowerCase();
        const args = fn.slice(fn.indexOf('(') + 1, -1);

        if (name === 'blur') {
            result.blur = Math.max(result.blur, parseFloat(args) || 0);
        } else if (name === 'drop-shadow') {
            const [shadow] = parseBoxShadow(args);
            if (shadow) result.dropShadows.push(shadow);
        } else {
            result.colorOnly.push(name);
        }
    }

    return result;
}

/**
 * Sizes the capture viewport. The formula only has to be generous - fully transparent
 * margins are trimmed from the captured PNG afterwards, and that trim is what actually
 * defines the recorded overflow.
 */
export function inkOverflow(boxShadow: string, filter: string): Insets {
    const ink: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

    const extend = (shadow: ShadowSpec, blurFactor: number) => {
        if (shadow.inset) return;
        const reach = shadow.blur * blurFactor + shadow.spread;
        ink.left = Math.max(ink.left, reach - shadow.dx);
        ink.right = Math.max(ink.right, reach + shadow.dx);
        ink.top = Math.max(ink.top, reach - shadow.dy);
        ink.bottom = Math.max(ink.bottom, reach + shadow.dy);
    };

    // A CSS box-shadow blur radius already bounds its visible extent; the filter functions
    // are Gaussian and reach roughly three standard deviations, hence the larger factors.
    for (const shadow of parseBoxShadow(boxShadow)) extend(shadow, 1);

    const filterExtent = parseFilter(filter);
    for (const shadow of filterExtent.dropShadows) extend(shadow, 2);

    if (filterExtent.blur > 0) {
        const reach = filterExtent.blur * 3;
        ink.top += reach;
        ink.right += reach;
        ink.bottom += reach;
        ink.left += reach;
    }

    return {
        top: Math.ceil(ink.top),
        right: Math.ceil(ink.right),
        bottom: Math.ceil(ink.bottom),
        left: Math.ceil(ink.left),
    };
}

/**
 * Widens the root's own ink overflow to cover everything the baked subtree paints.
 *
 * Element mode routinely marks a plain wrapper whose child draws the frame and its shadow, so
 * taking the root's decoration at face value would clip the bake and misplace the underlay by
 * exactly the shadow's reach. Only descendants that are actually baked contribute - live parts
 * are excluded during the subtree walk and paint themselves at runtime.
 */
export function subtreeInkOverflow(mark: RawMark, rootInk: Insets): Insets {
    if (!mark.decorated?.length) return rootInk;

    const ink = { ...rootInk };
    const { w: rootWidth, h: rootHeight } = mark.layoutSize;

    // Descendant boxes were measured with any ancestor transform still in force, while the
    // shadow and filter lengths come from computed styles and are already in layout units.
    // Dividing the boxes by the observed zoom puts both on the same scale.
    const zoom = mark.layoutSize.w > 0 && mark.rect.w > 0 ? mark.rect.w / mark.layoutSize.w : 1;
    const unzoom = (n: number) => (zoom > 0 ? n / zoom : n);

    for (const node of mark.decorated) {
        const extent = inkOverflow(node.boxShadow, node.filter);
        const box = { x: unzoom(node.box.x), y: unzoom(node.box.y), w: unzoom(node.box.w), h: unzoom(node.box.h) };

        // The node's box is relative to the root, so its reach past the root's edge is its own
        // reach minus however far inside the root it sits.
        ink.left = Math.max(ink.left, extent.left - box.x);
        ink.top = Math.max(ink.top, extent.top - box.y);
        ink.right = Math.max(ink.right, extent.right - (rootWidth - (box.x + box.w)));
        ink.bottom = Math.max(ink.bottom, extent.bottom - (rootHeight - (box.y + box.h)));
    }

    return {
        top: Math.ceil(Math.max(0, ink.top)),
        right: Math.ceil(Math.max(0, ink.right)),
        bottom: Math.ceil(Math.max(0, ink.bottom)),
        left: Math.ceil(Math.max(0, ink.left)),
    };
}

/** Whether a computed colour actually puts pixels on screen. */
export function isPainted(color: string): boolean {
    if (!color || color === 'transparent' || color === 'none') return false;

    const match = color.match(/rgba?\(([^)]+)\)/i);
    if (match) {
        const parts = match[1].split(',').map((p) => parseFloat(p));
        if (parts.length === 4 && parts[3] === 0) return false;
    }

    return true;
}

/** The minimum stretch strip in a 9-slice; wide enough that a 1px seam cannot show. */
const STRETCH_ZONE = 16;
/** Guard band so a corner never clips the last antialiased pixel of an arc. */
const CORNER_GUARD = 2;

/**
 * Canonical capture size for slice mode.
 *
 * `cornerBox` is how far the non-uniform pixels reach into the border box from each edge.
 * That is the radius arc *plus* the ink reach, not the larger of the two: a shadow around a
 * rounded corner stays curved for its whole blur radius past where the element's own corner
 * ends, and a strip cut any closer in still contains that curve - which is what makes a
 * stretch zone fail its uniformity check.
 *
 * The captured element is sized so the two opposing corners plus a uniform strip fit exactly.
 * The image-space slice insets add the ink overflow on top and are only known once the
 * capture has been trimmed, so they are computed in the bake stage rather than here.
 */
export function sliceGeometry(mark: RawMark, ink: Insets) {
    const { corners } = mark.style;
    const reach = Math.max(ink.top, ink.right, ink.bottom, ink.left);

    const cornerBox: Insets = {
        top: Math.ceil(Math.max(corners.tl, corners.tr) + reach + CORNER_GUARD),
        right: Math.ceil(Math.max(corners.tr, corners.br) + reach + CORNER_GUARD),
        bottom: Math.ceil(Math.max(corners.br, corners.bl) + reach + CORNER_GUARD),
        left: Math.ceil(Math.max(corners.tl, corners.bl) + reach + CORNER_GUARD),
    };

    const captureSize = {
        w: cornerBox.left + STRETCH_ZONE + cornerBox.right,
        h: cornerBox.top + STRETCH_ZONE + cornerBox.bottom,
    };

    return { cornerBox, captureSize };
}

/** Reads a declared width/height out of the cascade; `auto` mode uses this to pick flat vs slice. */
export function declaredSize(rules: MatchedRule[]): { width?: string; height?: string } {
    const declared: { width?: string; height?: string } = {};

    // CDP returns matched rules weakest-first, so a later declaration is the winning one.
    for (const rule of rules) {
        if (rule.declarations.width) declared.width = rule.declarations.width;
        if (rule.declarations.height) declared.height = rule.declarations.height;
    }

    return declared;
}

const FIXED_LENGTH = /^-?[\d.]+(px|rem|em|vh|vw|vmin|vmax)$/;

export function isFixedSize(declared: { width?: string; height?: string }): boolean {
    return !!declared.width && !!declared.height && FIXED_LENGTH.test(declared.width) && FIXED_LENGTH.test(declared.height);
}

/** Custom properties a decoration value depends on, read from the declared (not computed) values. */
export function referencedVariables(rules: MatchedRule[], properties: string[]): string[] {
    const names = new Set<string>();

    for (const rule of rules) {
        for (const property of properties) {
            const value = rule.declarations[property];
            if (!value) continue;
            for (const match of value.matchAll(/var\(\s*(--[\w-]+)/g)) names.add(match[1]);
        }
    }

    return [...names];
}

const DECORATION_PROPERTIES = [
    'box-shadow',
    'background',
    'background-image',
    'background-color',
    'border-radius',
    'border-image',
    'border-image-source',
    'filter',
    'mask-image',
    'border-color',
];

export interface PlanContext {
    options: ResolvedOptions;
    bag: DiagnosticBag;
    engineVersion: string;
    route: string;
    /** Custom properties that the bundle writes from JS, for RZ003. */
    jsWrittenVariables: Set<string>;
}

/**
 * Turns one introspected element into a bake plan, or into diagnostics explaining why it
 * cannot be baked. Returns null when the element is skipped.
 */
export function planMark(mark: RawMark, rules: MatchedRule[], ctx: PlanContext): BakePlan | null {
    const { bag, options } = ctx;
    const where = mark.authorId || mark.selectorPath;
    const style = mark.style;

    // §2.2 - the compositing invariant. Neither of these composites source-over, so a
    // pre-rendered texture cannot reproduce them against an arbitrary backdrop.
    if (mark.blockers.mixBlendMode !== 'normal' && mark.blockers.mixBlendMode !== '') {
        bag.add('RZ001', where, `mix-blend-mode: ${mark.blockers.mixBlendMode}`, ctx.route);
        return null;
    }
    if (mark.blockers.backdropFilter !== 'none' && mark.blockers.backdropFilter !== '') {
        bag.add('RZ001', where, `backdrop-filter: ${mark.blockers.backdropFilter}`, ctx.route);
        return null;
    }

    const hasShadow = style.boxShadow !== 'none' && style.boxShadow !== '';
    const hasGradient = style.backgroundImage !== 'none' && style.backgroundImage !== '';
    const hasFilter = style.filter !== 'none' && style.filter !== '';
    const hasMask = style.maskImage !== 'none' && style.maskImage !== '';
    const hasBorderImage = style.borderImageSource !== 'none' && style.borderImageSource !== '';
    const hasRadius = style.corners.tl > 0 || style.corners.tr > 0 || style.corners.br > 0 || style.corners.bl > 0;
    const hasFill = isPainted(style.backgroundColor);
    const hasBorder =
        (style.borderWidths.top > 0 || style.borderWidths.right > 0 || style.borderWidths.bottom > 0 || style.borderWidths.left > 0) &&
        isPainted(style.borderColors.top);

    const expensive = hasShadow || hasGradient || hasFilter || hasMask || hasBorderImage;
    const isElementMode = mark.mode === 'element';

    if (!isElementMode && !expensive && !(hasRadius && (hasFill || hasBorder))) {
        // §4.3: a radius on its own is cheap and stays live.
        bag.add('RZ007', where, 'nothing here is more expensive than a plain fill', ctx.route);
        return null;
    }

    // §8.2 - a baked property under transition swaps instantly instead of animating.
    const transitioned = splitTopLevel(mark.motion.transitionProperty).filter(
        (p) => p === 'all' || DECORATION_PROPERTIES.indexOf(p) !== -1
    );
    if (mark.motion.animationName !== 'none' && mark.motion.animationName !== '') {
        bag.add('RZ002', where, `animation: ${mark.motion.animationName}`, ctx.route);
    } else if (transitioned.length && /[1-9]/.test(mark.motion.transitionDuration)) {
        bag.add('RZ002', where, `transition: ${transitioned.join(', ')} ${mark.motion.transitionDuration}`, ctx.route);
    }

    // §9.3 - values frozen from custom properties that JS rewrites at runtime.
    const frozenVariables: Record<string, string> = {};
    for (const name of referencedVariables(rules, DECORATION_PROPERTIES)) {
        if (ctx.jsWrittenVariables.has(name)) {
            frozenVariables[name] = 'written from JS';
            bag.add('RZ003', where, `${name} is written from JS but feeds a baked property`, ctx.route);
        }
    }

    // Layout-affecting media queries make any pinned geometry valid for one breakpoint only.
    const layoutMedia = rules
        .flatMap((r) => r.media)
        .filter((m) => /\b(?:min|max)-(?:width|height|aspect-ratio)\b/.test(m));

    if (layoutMedia.length && isElementMode) {
        bag.add('RZ013', where, layoutMedia.join('; '), ctx.route);
        return null;
    }
    if (layoutMedia.length) {
        bag.add('RZ013', where, `${layoutMedia.join('; ')} - the bake matches the build-time breakpoint only`, ctx.route);
    }

    let mode: ResolvedMode;
    const declared = declaredSize(rules);

    if (isElementMode) {
        // §16.5 - a flattened subtree has a design-time size by definition.
        mode = 'element';
    } else if (mark.mode === 'flat') {
        if (!isFixedSize(declared)) {
            bag.add('RZ004', where, `declared size is ${declared.width ?? 'auto'} x ${declared.height ?? 'auto'}`, ctx.route);
            return null;
        }
        mode = 'flat';
    } else if (mark.mode === 'slice') {
        mode = 'slice';
    } else {
        mode = isFixedSize(declared) ? 'flat' : 'slice';
    }

    if (isElementMode && !planElementMode(mark, ctx, where)) return null;

    /**
     * `filter` and `mask-image` apply to an element's content as well as its decoration, so
     * whether they can be baked comes down to whether any content is still there afterwards.
     *
     * In decoration mode the children are live by definition, so both stay live and the capture
     * is taken without them. In element mode the subtree becomes pixels - and if nothing had to
     * stay live, there is no content left for them to apply to, so they can be baked in and the
     * per-frame cost removed entirely. That is the case worth catching: ten masked panels that
     * never change are ten masks the engine is re-evaluating for nothing.
     */
    const survivingLiveParts = isElementMode ? (mark.liveParts ?? []).filter((p) => !p.nestedMarker).length : 0;
    const contentStaysLive = hasContent(mark) && !(isElementMode && survivingLiveParts === 0);

    const bakeFilter = hasFilter && !contentStaysLive;
    const bakeMask = hasMask && !contentStaysLive;

    const ink = subtreeInkOverflow(mark, inkOverflow(style.boxShadow, bakeFilter ? style.filter : 'none'));

    // Layout units, not the painted rectangle. `rect` is measured before isolation, so an
    // ancestor transform is folded into it - and since the size feeds the bake hash, a row of
    // identical panels under slightly different depth scales would each get a private copy of
    // one identical texture instead of sharing it.
    let captureSize = { w: mark.layoutSize.w, h: mark.layoutSize.h };
    let cornerBox: Insets | undefined;

    if (mode === 'slice') {
        const geometry = sliceGeometry(mark, ink);
        cornerBox = geometry.cornerBox;
        captureSize = geometry.captureSize;

        // The two opposing corners have to fit side by side in whatever size the element is drawn
        // at. Below that they overlap, and border-image squashes them - which looks almost right,
        // which is the worst way for it to look. A wide soft glow on a small element is the usual
        // shape: at that point there is no uniform strip to stretch and slicing is the wrong tool,
        // so the bake is taken flat at the size the element actually is.
        const minWidth = cornerBox.left + cornerBox.right;
        const minHeight = cornerBox.top + cornerBox.bottom;

        if (mark.layoutSize.w < minWidth || mark.layoutSize.h < minHeight) {
            mode = 'flat';
            cornerBox = undefined;
            captureSize = { w: mark.layoutSize.w, h: mark.layoutSize.h };

            bag.add(
                'RZ024',
                where,
                `it renders at ${Math.round(mark.layoutSize.w)}x${Math.round(mark.layoutSize.h)} but its corners ` +
                    `alone need ${minWidth}x${minHeight}, so there is no uniform strip left to stretch. ` +
                    'Baked flat at the size it was measured instead, which is exact at that size and will ' +
                    'stretch if the element is resized at runtime. A smaller blur or radius would let it slice',
                ctx.route
            );
        }
    }

    const neutralize: string[] = [];
    const stripped: string[] = [];

    if (hasShadow) stripped.push('box-shadow');
    if (hasGradient) stripped.push('background-image');
    if (hasFill) stripped.push('background-color');
    if (hasBorderImage) stripped.push('border-image-source');
    if (hasBorder) stripped.push('border-color');

    if (hasRadius) {
        // A radius that clips content is doing layout work, not decoration; leave it alone.
        const clips = style.overflow === 'hidden' || style.overflow === 'clip' || style.overflow === 'scroll';
        if (!clips) stripped.push('border-radius');
    }

    if (hasFilter) {
        if (bakeFilter) stripped.push('filter');
        else neutralize.push('filter');
    }
    if (hasMask) {
        if (bakeMask) stripped.push('mask-image');
        else neutralize.push('maskImage');
    }

    // Both effects run every frame for as long as they are live, so it is worth saying when one
    // survived the bake and what would have let it go.
    if ((hasFilter && !bakeFilter) || (hasMask && !bakeMask)) {
        const names = [hasFilter && !bakeFilter ? 'filter' : '', hasMask && !bakeMask ? 'mask-image' : ''].filter(Boolean);
        const kept = names.join(' and ');
        const verb = names.length > 1 ? 'run' : 'runs';
        const parts =
            survivingLiveParts === 1
                ? 'one part of this subtree stays live'
                : `${survivingLiveParts} parts of this subtree stay live`;

        bag.add(
            'RZ025',
            where,
            isElementMode
                ? `${kept} still ${verb} every frame, because ${parts} and would lose the effect if it were baked ` +
                  'in. Everything else here did become a texture'
                : `${kept} still ${verb} every frame, because this element has live children that need it. If the ` +
                  'whole subtree is static, data-rasterize-mode="element" bakes the children in too and the effect ' +
                  'goes with them',
            ctx.route
        );
    }

    const scale = mark.scaleOverride && mark.scaleOverride > 0 ? mark.scaleOverride : options.bakeScale;
    const states = ['base', ...resolveStates(mark, bag, where, ctx.route)];

    const hash = createHash('sha256')
        .update(
            JSON.stringify({
                contract: CONTRACT_VERSION,
                engine: ctx.engineVersion,
                style,
                mode,
                scale,
                captureSize,
                cornerBox,
                states,
                ink,
                liveParts: mark.liveParts?.map((p) => [p.path, p.box]),
            })
        )
        .digest('hex')
        .slice(0, 16);

    return {
        assetId: assetIdFor(mark, hash),
        uid: mark.uid,
        mark,
        mode,
        scale,
        inkOverflow: ink,
        captureSize,
        cornerBox,
        states,
        strippedProperties: stripped,
        neutralize,
        frozenVariables,
        hash,
        route: ctx.route,
    };
}

/** True when the element has anything of its own to draw on top of the underlay. */
export function hasContent(mark: RawMark): boolean {
    return mark.childElementCount > 0 || mark.hasText;
}

function resolveStates(mark: RawMark, bag: DiagnosticBag, where: string, route: string): string[] {
    const states: string[] = [];

    for (const state of mark.statesRequested) {
        if (state.startsWith('class:') || (PSEUDO_STATES as readonly string[]).includes(state)) {
            states.push(state);
        } else {
            bag.add('RZ007', where, `unknown state "${state}"; expected one of ${PSEUDO_STATES.join(', ')} or class:<name>`, route);
        }
    }

    return states;
}

/** §16 checks that apply only to element mode. Returns false when the element is skipped. */
function planElementMode(mark: RawMark, ctx: PlanContext, where: string): boolean {
    const { bag } = ctx;
    const liveParts = mark.liveParts ?? [];

    for (const nested of liveParts.filter((p) => p.nestedMarker)) {
        bag.add('RZ014', where, `nested marker at [${nested.path.join(',')}] <${nested.tag}>`, ctx.route);
    }

    const layoutDynamic = mark.layoutDynamic ?? [];
    if (layoutDynamic.length) {
        bag.add(
            'RZ011',
            where,
            layoutDynamic.map((p) => `<${p.tag}> ${p.layoutDynamic}`).join('; '),
            ctx.route
        );
        return false;
    }

    const real = liveParts.filter((p) => !p.nestedMarker);
    const undeclared = real.filter((p) => p.reason !== 'declared');

    if (undeclared.length) {
        bag.add('RZ012', where, undeclared.map((p) => `<${p.tag}> ${p.reason} (${p.detail})`).join('; '), ctx.route);
    }

    // §16.1 - if every node in the subtree has to stay live there is nothing left to flatten.
    const total = mark.subtreeNodeCount ?? 0;
    if (total > 0 && real.length > 0 && real.every((p) => p.path.length === 1) && real.length === countTopLevel(mark)) {
        bag.add('RZ010', where, 'every child of the marked element must stay live', ctx.route);
        return false;
    }

    return true;
}

function countTopLevel(mark: RawMark): number {
    return mark.childElementCount;
}

function assetIdFor(mark: RawMark, hash: string): string {
    if (mark.authorId) return mark.authorId;

    const slug = [mark.tag, ...mark.classes.slice(0, 2)]
        .join('-')
        .replace(/[^a-z0-9-]/gi, '')
        .toLowerCase()
        .slice(0, 40);

    return `${slug || 'rz'}-${hash.slice(0, 8)}`;
}
