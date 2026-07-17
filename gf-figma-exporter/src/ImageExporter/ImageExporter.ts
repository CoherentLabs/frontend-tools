import { ExportableNodes, MaskNode, NodesWithFillsAndStrokes, PrimitiveNodes, SVGNodes } from '../types/commonTypes';
import { currentPageSize } from '../utils/currentPage';
import hasVisiblePaint from '../utils/hasVisiblePaint';
import toggleChildren from '../utils/toggleChildren';
import handleImage from './utils/handleImages';
import shouldExportBackground from './utils/shouldExportBackground';
import shouldExportStroke from './utils/shouldExportStroke';
import {
    hideEffects,
    hideFills,
    hideStrokes,
    removeTransform,
} from './utils/toggleUtils';

interface GFBackgroundAndStroke {
    background: {
        name: string;
        data: Uint8Array | null;
    } | null;
    border: {
        name: string;
        data: Uint8Array | null;
    } | null;
}

// A node's absoluteRenderBounds already reflects whatever ancestor clipping exists in the live
// document — e.g. an effect that wants to bleed 100px but is truncated to 56px by a parent's padded,
// clipsContent: true edge. Sizing the isolated export stage to this (rather than either leaving it
// fully unclipped, which over-bleeds, or using the node's own bounding box, which can clip a node's
// content away entirely) reproduces the correct, as-seen-in-Figma extent.
export function getExportStageBounds(
    node: SceneNode
): { width: number; height: number; offsetX: number; offsetY: number } | null {
    if (!('absoluteRenderBounds' in node) || !('absoluteBoundingBox' in node)) return null;

    const renderBounds = node.absoluteRenderBounds;
    const boundingBox = node.absoluteBoundingBox;

    if (!renderBounds || !boundingBox) return null;

    return {
        width: renderBounds.width,
        height: renderBounds.height,
        offsetX: boundingBox.x - renderBounds.x,
        offsetY: boundingBox.y - renderBounds.y,
    };
}

export type MaskBleedBounds = { width: number; height: number; offsetX: number; offsetY: number; hasBleed: boolean };

// Figma reports absoluteRenderBounds as null for any node with isMask: true — a pure mask shape isn't
// painted as visible content on its own, only used as a clip/alpha reference, so getExportStageBounds
// can't read bleed bounds directly off a live mask node (it silently falls through to the "no bounds"
// case below). Clones the node, unmasks the clone just long enough to read valid bounds, then removes
// the clone immediately.
//
// The clone is reparented to the page BEFORE unmasking/measuring, not after — .clone() otherwise leaves
// it sitting inside the mask's real, live parent. Flipping isMask to false on a node that's still
// attached there makes Figma treat it as a normal, layout-participating visible child instead of a
// non-rendering mask reference, which can trigger the parent's own auto-layout to reflow (especially
// with HUG sizing) or clip it via the parent's clipsContent — either would corrupt the very bounds we're
// trying to measure. Detaching first means neither can ever factor in.
//
// hasBleed is deliberately computed from ONLY this same detached clone's own two measurements
// (its own absoluteBoundingBox vs its own absoluteRenderBounds) — never compared against the original,
// still-live node. A mask living inside an auto-layout parent with FILL/stretch sizing can have a live,
// attached size that legitimately differs from what the clone measures once detached and no longer being
// stretched; comparing across that context switch produces false positives for masks with no real bleed
// at all, sending ordinary masks down the bleed-handling path by mistake.
export function getMaskBleedBounds(node: SceneNode): MaskBleedBounds | null {
    const clone = node.clone();
    figma.currentPage.appendChild(clone);

    if ('isMask' in clone) {
        clone.isMask = false;
    }

    const boundingBox = clone.absoluteBoundingBox;
    const bounds = getExportStageBounds(clone);
    clone.remove();

    if (!bounds || !boundingBox) return null;

    const hasBleed = bounds.offsetX !== 0 ||
        bounds.offsetY !== 0 ||
        bounds.width !== boundingBox.width ||
        bounds.height !== boundingBox.height;

    return { ...bounds, hasBleed };
}

// Creates the shared "clone into an isolated stage" frame used by every clean-image export below.
// Clips to the node's true rendered bounds when available; falls back to a large, unclipped stage when
// there's no render bounds info at all (a node an ancestor is clipping away to nothing, per the earlier
// "may not have any visible layers" export failure) so the node's own content still renders.
// precomputedBounds lets a caller (e.g. exportMaskImage) supply bounds measured some other way — the
// node passed here isn't necessarily the same one those bounds were measured from — instead of
// recomputing them from `node` directly.
function createExportStage(
    node: SceneNode,
    precomputedBounds?: ReturnType<typeof getExportStageBounds>
): { stage: FrameNode; offsetX: number; offsetY: number } {
    const bounds = precomputedBounds !== undefined ? precomputedBounds : getExportStageBounds(node);
    const exportStage = figma.createFrame();
    exportStage.name = 'TEMP EXPORT STAGE';
    exportStage.fills = []; // Transparent
    exportStage.x = 100000; // Move far away so user doesn't see flicker

    if (bounds) {
        exportStage.resize(bounds.width, bounds.height);
        exportStage.clipsContent = true;
    } else {
        exportStage.resize(currentPageSize.width, currentPageSize.height);
        exportStage.clipsContent = false;
    }

    figma.currentPage.appendChild(exportStage);

    return { stage: exportStage, offsetX: bounds?.offsetX ?? 0, offsetY: bounds?.offsetY ?? 0 };
}

class ImageExporter {
    async export(node: NodesWithFillsAndStrokes): Promise<GFBackgroundAndStroke> {
        const result: GFBackgroundAndStroke = {
            background: null,
            border: null,
        };

        result.background = await this.exportBackgroundImage(node);
        result.border = await this.exportStrokeImage(node);

        return result;
    }

    async exportBackgroundImage(
        node: NodesWithFillsAndStrokes
    ): Promise<{ name: string; data: Uint8Array | null } | null> {
        if (!shouldExportBackground(node)) return null;

        return await this.exportCleanImage(node, 'background');
    }

    async exportStrokeImage(node: NodesWithFillsAndStrokes): Promise<{ name: string; data: Uint8Array | null } | null> {
        if (!shouldExportStroke(node)) return null;

        return await this.exportCleanImage(node, 'border');
    }

    private async exportCleanImage(
        node: NodesWithFillsAndStrokes,
        type: 'background' | 'border' | 'full'
    ): Promise<{ name: string; data: Uint8Array | null } | null> {
        const clone = node.clone() as NodesWithFillsAndStrokes;
        const { stage: exportStage, offsetX, offsetY } = createExportStage(node);

        exportStage.appendChild(clone);

        if (clone.type === 'FRAME') {
            // Temporarily hide children to avoid exporting them in the background image
            toggleChildren(clone, false);
        }

        // Hide strokes and effects to export only the background

        type === 'border' ? hideFills(clone) : hideStrokes(clone);
        hideEffects(clone);
        removeTransform(clone);
        clone.x = offsetX;
        clone.y = offsetY;

        const { name, data } = await handleImage(clone, type, 'PNG', node.id);
        if (!data) return null;


        exportStage.remove();

        return {
            name,
            data,
        };
    }

    async exportImage(node: ExportableNodes): Promise<{ name: string; data: Uint8Array | null } | null> {
        return await handleImage(node as SceneNode, 'full', 'PNG');
    }

    async exportVectorAsSVG(node: SVGNodes): Promise<{ name: string; data: Uint8Array | null } | null> {
        return this.exportVectorClean(node, 'SVG');
    }

    async exportVectorAsPNG(node: SVGNodes): Promise<{ name: string; data: Uint8Array | null } | null> {
        return this.exportVectorClean(node, 'PNG');
    }

    private async exportVectorClean(
        node: SVGNodes,
        format: 'SVG' | 'PNG'
    ): Promise<{ name: string; data: Uint8Array | null } | null> {
        if (!hasVisiblePaint(node)) return null;

        // Export a clone in an isolated stage rather than the live node in place — the live node may
        // sit inside an ancestor (frame/instance) with clipsContent: true, which either clips its
        // rendered content down to a specific extent (e.g. an effect's bleed) or, if it clips the node
        // away entirely, makes Figma treat it as rendering no visible pixels at all.
        const clone = (node as unknown as SceneNode).clone() as SVGNodes;
        const { stage: exportStage, offsetX, offsetY } = createExportStage(node as unknown as SceneNode);

        exportStage.appendChild(clone as unknown as SceneNode);

        removeTransform(clone as unknown as PrimitiveNodes);
        (clone as unknown as SceneNode).x = offsetX;
        (clone as unknown as SceneNode).y = offsetY;

        const result = await handleImage(clone as unknown as SceneNode, 'full', format, node.id);

        exportStage.remove();

        return result;
    }

    // bleedBounds is precomputed by the caller (Mask.ts, via getMaskBleedBounds) so the "does this mask
    // bleed" decision is made exactly once and shared between the CSS (mask-size/position, wrapper sizing)
    // and this image export — rather than each recomputing its own answer and risking disagreement.
    async exportMaskImage(
        node: MaskNode,
        bleedBounds: MaskBleedBounds | null
    ): Promise<{ name: string; data: Uint8Array | null } | null> {
        const originalNode = node.originalNode as SceneNode;
        const clone = originalNode.clone() as NodesWithFillsAndStrokes;

        if (!bleedBounds || !bleedBounds.hasBleed) {
            return this.exportNonBleedingMask(node, originalNode, clone);
        }

        return this.exportBleedingMask(node, originalNode, clone, bleedBounds);
    }

    // Normal path — exactly the original, proven implementation, untouched. A mask's own
    // absoluteRenderBounds is null (Figma doesn't compute render bounds for a pure mask reference), so
    // createExportStage always falls back to a large, unclipped stage here; export crops to the clone's
    // own rendered bounds regardless of where it sits within that stage, so the imprecise offsetX/offsetY
    // (defaulting to 0 when bounds are unavailable) never actually matters for this path.
    private async exportNonBleedingMask(
        node: MaskNode,
        originalNode: SceneNode,
        clone: NodesWithFillsAndStrokes
    ): Promise<{ name: string; data: Uint8Array | null } | null> {
        const { stage: exportStage, offsetX, offsetY } = createExportStage(originalNode);

        exportStage.appendChild(clone);

        clone.name = node.name;
        clone.isMask = false;
        clone.x = offsetX;
        clone.y = offsetY;

        const result = await handleImage(clone, 'full', 'PNG', node.originalNode.id);

        exportStage.remove();

        return result;
    }

    // Bleeding path — needs the mask's true (bleed-inclusive) bounds, which requires briefly unmasking a
    // detached clone to read a valid absoluteRenderBounds at all (see getMaskBleedBounds).
    private async exportBleedingMask(
        node: MaskNode,
        originalNode: SceneNode,
        clone: NodesWithFillsAndStrokes,
        bleedBounds: MaskBleedBounds
    ): Promise<{ name: string; data: Uint8Array | null } | null> {
        // Detach from the live parent before unmasking — see getMaskBleedBounds's comment for why
        // mutating isMask on a still-attached clone can corrupt bounds via the parent's own auto-layout
        // reflow or clipsContent.
        figma.currentPage.appendChild(clone as unknown as SceneNode);
        clone.isMask = false;

        const { stage: exportStage, offsetX, offsetY } = createExportStage(originalNode, bleedBounds);

        exportStage.appendChild(clone);

        // Unlike the normal path above, this deliberately never calls removeTransform — a mask's own
        // rotation must stay baked into the exported image's pixels, since applying a CSS transform to
        // the mask's wrapper div instead would also rotate its masked children (nested inside that same
        // div), unlike Figma where they're independent siblings unaffected by the mask's rotation.
        // Because rotation is preserved, clone.x/y (the position of the clone's own local, pre-rotation
        // box) is not the same point as its AABB's top-left, so it can't be assigned offsetX/offsetY
        // directly the way the normal path does — that would place the rotated shape at the wrong spot,
        // which the stage's clipsContent would then crop away entirely. Shifting by the delta needed to
        // move its current AABB to the target position works regardless of rotation, since a translation
        // delta is rotation-independent. This is computed AFTER reparenting into exportStage (not
        // before) — appendChild does not reliably preserve absolute position across every reparent
        // (observed directly: x/y can stay numerically unchanged while the node's real page position
        // shifts by the new parent's own offset), so any delta computed against a pre-reparent position
        // goes stale the moment the node actually moves.
        const cloneBoundingBox = (clone as unknown as SceneNode).absoluteBoundingBox;
        if (cloneBoundingBox) {
            clone.x += exportStage.x + offsetX - cloneBoundingBox.x;
            clone.y += exportStage.y + offsetY - cloneBoundingBox.y;
        }

        clone.name = node.name;

        const result = await handleImage(clone, 'full', 'PNG', node.originalNode.id);

        exportStage.remove();

        return result;
    }

    static shouldExportImage(node: NodesWithFillsAndStrokes): boolean {
        if (shouldExportBackground(node) || shouldExportStroke(node)) {
            return true;
        }
        return false;
    }
}

export default ImageExporter;
