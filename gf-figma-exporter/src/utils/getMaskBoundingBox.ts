import { getMaskBleedBounds } from '../ImageExporter/ImageExporter';
import { AvailableNode } from '../types/commonTypes';

export default function getMaskBoundingBox(
    node: AvailableNode
): { x: number; y: number; width: number; height: number } | null {
    if (!node.isMask) {
        return null;
    }

    return node.absoluteBoundingBox || null;
}

// Masked children (position.ts's getAdjustedPosition/getEffectiveDimensions) are positioned and sized
// as percentages relative to this box. When the mask actually bleeds, Mask.ts resizes/shifts its own
// wrapping div to the bleed-expanded bounds (see getMaskBleedBounds) — masked children need the same
// expanded box to stay aligned, since their 0%/0% would otherwise resolve against a box that doesn't
// match what they're actually nested inside. For a normal (non-bleeding) mask, getMaskBleedBounds's
// self-consistent hasBleed is false and this returns exactly the plain absoluteBoundingBox — same as
// the default export above — so ordinary masks are completely unaffected by this function existing.
export function getMaskBleedBoundingBox(
    node: AvailableNode
): { x: number; y: number; width: number; height: number } | null {
    if (!node.isMask) {
        return null;
    }

    const boundingBox = node.absoluteBoundingBox;
    if (!boundingBox) {
        return null;
    }

    const bleedBounds = getMaskBleedBounds(node as unknown as SceneNode);
    if (!bleedBounds || !bleedBounds.hasBleed) {
        return boundingBox;
    }

    return {
        x: boundingBox.x - bleedBounds.offsetX,
        y: boundingBox.y - bleedBounds.offsetY,
        width: bleedBounds.width,
        height: bleedBounds.height,
    };
}
