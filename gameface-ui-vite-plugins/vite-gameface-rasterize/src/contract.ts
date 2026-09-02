/**
 * The attribute contract between authoring code and the build pipeline, plus the
 * manifest schema. Nothing in this file knows about Vite, Node or the Player - it is
 * the shared vocabulary that hand-written HTML, a framework's sugar component and the
 * emitted runtime all agree on.
 *
 * The contract version is recorded in every manifest and mixed into every bake key, so
 * a change here naturally invalidates caches instead of silently reusing stale assets.
 */

export const CONTRACT_VERSION = '1.0';

export const ATTR = {
    /** Presence marks an element for baking. */
    mark: 'data-rasterize',
    /** "auto" (default) | "slice" | "flat" | "element" */
    mode: 'data-rasterize-mode',
    /** Comma list of state variants, e.g. "hover,active" or "class:selected". */
    states: 'data-rasterize-states',
    /** Stable author-chosen id; otherwise one is derived. */
    id: 'data-rasterize-id',
    /** Per-element override of the bake scale. */
    scale: 'data-rasterize-scale',
    /** Inside an element-mode subtree: force this node to stay live DOM. */
    live: 'data-rasterize-live',
} as const;

/** Attribute the pipeline stamps onto matched elements at runtime; all emitted CSS keys off it. */
export const RUNTIME_ATTR = {
    /** Set on the marked element itself: `[data-rz-id="<assetId>"]`. */
    id: 'data-rz-id',
    /** Set on the generated underlay child: `[data-rz-underlay="<assetId>"]`. */
    underlay: 'data-rz-underlay',
    /** Which state variant an underlay represents ("base", "hover", ...). */
    state: 'data-rz-state',
    /** Present on the underlay whose state is currently showing. */
    active: 'data-rz-active',
    /** Set on a pinned live part in element mode: `[data-rz-live="<assetId>:<index>"]`. */
    livePart: 'data-rz-live',
} as const;

export type RasterizeMode = 'auto' | 'slice' | 'flat' | 'element';
/** The mode actually used for a bake - "auto" is always resolved before it reaches a manifest. */
export type ResolvedMode = Exclude<RasterizeMode, 'auto'>;

export interface Insets {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface StateAsset {
    /** Path of the PNG relative to the output directory. */
    src: string;
    /** Optional transcoded companion. */
    webp?: string;
    /** Image dimensions in texture pixels (i.e. CSS pixels x bakeScale). */
    w: number;
    h: number;
    bytes: number;
    /** Uncompressed GPU footprint estimate: w * h * 4. */
    vramEstBytes: number;
}

export interface LivePart {
    /** Child index path from the marked root, e.g. [0, 2, 1]. */
    path: number[];
    /** Why this node was kept live. */
    reason: 'binding' | 'animation' | 'interactable' | 'declared';
    /** Detail for the build report, e.g. the attribute or tag that triggered it. */
    detail: string;
    /** Geometry relative to the marked root's border box, in CSS pixels. */
    box: Box;
    units: 'px';
}

export interface AssetEntry {
    mode: ResolvedMode;
    /** Properties the emitted CSS neutralises on the live element. */
    strippedProperties: string[];
    /** How far the decoration's ink extends past the border box, per side, in CSS px. */
    inkOverflow: Insets;
    /** 9-slice corner insets in CSS px; slice mode only. */
    sliceInsets?: Insets;
    /** Border box size the bake was captured at, in CSS px. */
    captureSize: { w: number; h: number };
    /** Border widths of the marked element, needed to place the underlay correctly. */
    borderWidths: Insets;
    /**
     * The marked element's own `position` at capture time.
     *
     * The emitted rules only give it `position: relative` when this is `static`;
     * an element the author already positioned must keep the positioning it was
     * written with. Absent in manifests written before this field existed, which
     * are read back as `static` - the CSS default, and what the emitter used to
     * assume unconditionally.
     */
    position?: string;
    bakeScale: number;
    states: Record<string, StateAsset>;
    /** Element mode only. */
    liveParts?: LivePart[];
    /** Element mode only: how many wrapper nodes the flattened output no longer needs to draw. */
    removedNodes?: number;
    /** Custom properties whose values were frozen into the bake. */
    frozenVariables?: Record<string, string>;
    hash: string;
    diagnostics: string[];
}

/**
 * How the runtime finds the elements an asset belongs to. Matching is by tag + class
 * list rather than by document position, so N identical cards share one texture; the
 * selector path is the tiebreaker when two same-class elements bake differently.
 */
export interface AssetMatcher {
    assetId: string;
    tag: string;
    classes: string[];
    /** Set when the author supplied data-rasterize-id. */
    authorId?: string;
    /**
     * A class on some ancestor that separates this bake from the others sharing its tag and
     * class list - the `.wm--hostile` in `.wm--hostile .wm__frame`.
     *
     * Without it, every element whose variant is selected through an ancestor presents the same
     * match key, and only the one element sitting at the recorded selector path would resolve;
     * the rest keep their live CSS while the build reports success.
     */
    ancestorClass?: string;
    /** Fallback used only when tag+classes are ambiguous and no ancestor class separates them. */
    selectorPath?: string;
    /** True when this matcher can only be resolved by selectorPath, i.e. one element. */
    ambiguous?: boolean;
}

export interface RasterizeManifest {
    contractVersion: string;
    engineVersion: string;
    bakeScale: number;
    generatedFrom: string[];
    assets: Record<string, AssetEntry>;
    matchers: AssetMatcher[];
    totals: {
        vramEstBytes: number;
        budgetBytes: number;
        assetCount: number;
        removedNodes: number;
    };
}

/** Parses `data-rasterize-states` into its variant names. */
export function parseStates(value: string | null | undefined): string[] {
    if (!value) return [];
    return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

/** v1 pseudo-class variants; anything else must use the `class:` form. */
export const PSEUDO_STATES = ['hover', 'active', 'focus', 'disabled'] as const;
