/**
 * Shapes exchanged with the page. Everything here must be JSON-serialisable: the browser
 * side of this plugin is stringified and evaluated inside cohtml, so these are types only -
 * importing them costs nothing at runtime.
 */
import type { Box, Insets } from '../contract.js';

export interface DecorationStyle {
    boxShadow: string;
    backgroundImage: string;
    backgroundColor: string;
    borderRadius: string;
    corners: { tl: number; tr: number; br: number; bl: number };
    filter: string;
    maskImage: string;
    borderImageSource: string;
    borderWidths: Insets;
    borderColors: { top: string; right: string; bottom: string; left: string };
    borderStyles: { top: string; right: string; bottom: string; left: string };
    boxSizing: string;
    position: string;
    display: string;
    overflow: string;
}

export interface Motion {
    transitionProperty: string;
    transitionDuration: string;
    animationName: string;
}

export interface Blockers {
    mixBlendMode: string;
    backdropFilter: string;
}

export interface RawDescendant {
    /** Child-index path from the marked root. */
    path: number[];
    tag: string;
    classes: string[];
    /** Border box relative to the marked root's border box, in CSS px. */
    box: Box;
    reason: 'binding' | 'animation' | 'interactable' | 'declared';
    detail: string;
    /** Set when this node changes how much space it takes, not just what it shows. */
    layoutDynamic?: string;
    /** A rasterize marker nested inside an element-mode subtree (RZ014). */
    nestedMarker?: boolean;
}

export interface RawMark {
    uid: number;
    authorId: string | null;
    mode: string;
    statesRequested: string[];
    scaleOverride: number | null;
    tag: string;
    classes: string[];
    selectorPath: string;
    /**
     * Classes of each ancestor, nearest first. Used to tell apart elements whose own tag and
     * classes are identical but whose decoration is selected through an ancestor
     * (`.wm--hostile .wm__frame`) - without this they all present the same match key.
     */
    ancestry: { tag: string; classes: string[] }[];
    /** Border box in viewport coordinates, as painted - includes any ancestor transform. */
    rect: Box;
    /**
     * Border box in layout units, from offsetWidth/offsetHeight.
     *
     * This is the size that feeds the capture and the bake hash. `rect` cannot: it is measured
     * before isolation, so an ancestor transform is folded into it, and forty-four nameplates
     * under forty-four slightly different depth scales would each hash to a private copy of one
     * identical texture. Layout units do not move when something above is scaled.
     */
    layoutSize: { w: number; h: number };
    style: DecorationStyle;
    blockers: Blockers;
    motion: Motion;
    childElementCount: number;
    hasText: boolean;
    /**
     * Element mode only: descendants that paint something reaching past their own box. In
     * element mode the root often has no decoration at all - an inner frame draws it - so the
     * bake's ink overflow has to come from the subtree, not from the marked element.
     */
    decorated?: { box: Box; boxShadow: string; filter: string }[];
    /** Element mode only. */
    liveParts?: RawDescendant[];
    subtreeNodeCount?: number;
    /** Element mode only: nodes that make the subtree's layout dynamic (RZ011). */
    layoutDynamic?: RawDescendant[];
}

export interface AdvisorHit {
    selectorPath: string;
    tag: string;
    classes: string[];
    properties: string[];
}

export interface IntrospectResult {
    marks: RawMark[];
    advisor: AdvisorHit[];
    viewport: { width: number; height: number };
}

export interface IsolateRequest {
    uid: number;
    /** Supersampling factor applied via transform - clip.scale is ignored by the Player. */
    scale: number;
    /** Distance from the viewport origin to place the element's border box top-left. */
    pad: number;
    /** Force the element to this border-box size before capturing (slice mode). */
    sizeOverride: { w: number; h: number } | null;
    /** Hide the element's own content so only its decoration is captured. */
    hideContent: boolean;
    /**
     * Camel-cased properties to switch off on the target for the duration of the capture.
     * filter and mask-image land here when the element has content: they apply to the
     * content as well as the decoration, so they stay live and the bake is taken without them.
     */
    neutralize: string[];
    /** Element mode: child-index paths of nodes to hide so the bake contains no stale copy. */
    hidePaths: number[][];
    /**
     * Verification only: keep the generated underlays visible while hiding the element's own
     * content, so the baked result can be compared against the live one like for like.
     */
    keepUnderlays?: boolean;
}

export interface PlaceRequest {
    uid: number;
    /** Supersampling factor applied via transform - clip.scale is ignored by the Player. */
    scale: number;
    /** Distance from the viewport origin to place the element's border box top-left. */
    pad: number;
    /** Element mode: child-index paths whose geometry should be measured before placing. */
    measurePaths?: number[][];
}

export interface MeasuredLivePart {
    path: number[];
    box: Box;
    resolved: boolean;
}

export interface IsolateResult {
    /**
     * Element mode: live-part geometry re-measured while isolated, so it is free of the
     * ancestor transforms and clipping that were still in force during introspection.
     */
    liveParts?: MeasuredLivePart[];
    /** Where the border box is drawn, in viewport coordinates, after the transform. */
    rect: Box;
    /**
     * Where the element's layout box still is, for diagnostics. Input is aimed at `rect`
     * instead: hit-testing follows the transform even though getBoundingClientRect does not.
     */
    hitRect: Box;
    /** The element's border-box size in CSS px at the moment of capture. */
    cssSize: { w: number; h: number };
    borderWidths: Insets;
    warnings: string[];
}
