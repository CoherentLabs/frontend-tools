import { ExportableNodes } from '../../types/commonTypes';
import generateImageName from '../../utils/generateImageName';
import { NodesWithFillsAndStrokes } from '../../types/commonTypes';
import getPathBBox from '../../utils/getPathBBox';
import { getPercentage } from '../../utils/convertUnits';

export function generateMaskStyle(node: ExportableNodes): string {
    return `./${generateImageName(node.name, node.id, 'full')}`;
}

// This is the "normal" (non-bleeding) mask sizing path — bleeding masks are handled entirely separately
// in Mask.ts (see the hasBleed branch there), which sizes/positions the mask wrapper itself instead of
// going through this percentage-based mask-size/mask-position calculation. Keeping bleed handling out of
// this function entirely means this path is exactly what it was before bleed support existed, with no
// risk of the two mechanisms interfering with each other.
export async function getMaskPosition(
    node: NodesWithFillsAndStrokes
): Promise<{ x: number; y: number; width: string; height: string }> {
    const { fillGeometry } = node;
    const outset = getStrokeOutset(node);
    const hasOutset = outset.top > 0 || outset.right > 0 || outset.bottom > 0 || outset.left > 0;

    // If there is no fillGeometry or it's empty, return a sensible default rect
    if (!fillGeometry || fillGeometry.length === 0) {
        if (!hasOutset) {
            return { x: 0, y: 0, width: '100%', height: '100%' };
        }

        return applyMaskBox({ x: 0, y: 0, width: node.width, height: node.height }, outset, node);
    }

    const bbox = await getPathBBox(fillGeometry[0].data);

    if (!bbox) {
        if (!hasOutset) {
            return { x: 0, y: 0, width: '100%', height: '100%' };
        }

        return applyMaskBox({ x: 0, y: 0, width: node.width, height: node.height }, outset, node);
    }

    if (!hasOutset) {
        const x = Number(getPercentage(bbox.x, node.width).toFixed(2));
        const y = Number(getPercentage(bbox.y, node.height).toFixed(2));
        const width = getPercentage(bbox.width, node.width).toFixed(2);
        const height = getPercentage(bbox.height, node.height).toFixed(2);

        return {
            x: Number(calculateMaskPos(x, parseFloat(width)).toFixed(2)),
            y: Number(calculateMaskPos(y, parseFloat(height)).toFixed(2)),
            width,
            height,
        };
    }

    return applyMaskBox(bbox, outset, node);
}

function calculateMaskPos(position: number, maskDimension: number ): number {
    if (maskDimension >= 100) {
        return 0;
    }
    return (position / (100 - maskDimension)) * 100
}

// The exported mask image (see exportMaskImage/createExportStage) can include a stroke that extends
// beyond the fill bounds when strokeAlign is OUTSIDE or CENTER. This expands the fill box by that
// overflow and recomputes size/position so mask-size/mask-position map the full exported image correctly
// instead of squashing the stroke into the fill's box. Kept separate from calculateMaskPos/the branches
// above so nodes without a qualifying stroke are completely unaffected by this calculation.
function applyMaskBox(
    box: { x: number; y: number; width: number; height: number },
    outset: { top: number; right: number; bottom: number; left: number },
    node: NodesWithFillsAndStrokes
): { x: number; y: number; width: string; height: string } {
    const expandedX = box.x - outset.left;
    const expandedY = box.y - outset.top;
    const expandedWidth = box.width + outset.left + outset.right;
    const expandedHeight = box.height + outset.top + outset.bottom;

    const width = getPercentage(expandedWidth, node.width).toFixed(2);
    const height = getPercentage(expandedHeight, node.height).toFixed(2);
    const x = getPercentage(expandedX, node.width);
    const y = getPercentage(expandedY, node.height);

    return {
        x: Number(calculateOversizedMaskPos(x, parseFloat(width)).toFixed(2)),
        y: Number(calculateOversizedMaskPos(y, parseFloat(height)).toFixed(2)),
        width,
        height,
    };
}

// Same CSS background-position formula as calculateMaskPos, but without the >=100 clamp: a stroke-expanded
// mask box legitimately exceeds 100% of the node's own size and needs a genuine negative offset, not 0.
function calculateOversizedMaskPos(position: number, maskDimension: number): number {
    if (maskDimension === 100) {
        return 0;
    }
    return (position / (100 - maskDimension)) * 100;
}

function getStrokeOutset(node: NodesWithFillsAndStrokes): { top: number; right: number; bottom: number; left: number } {
    const zero = { top: 0, right: 0, bottom: 0, left: 0 };

    if (!node.strokes || node.strokes.length === 0) return zero;
    if (node.strokes.every((stroke) => stroke.visible === false)) return zero;
    if (node.strokeAlign === 'INSIDE') return zero;

    const multiplier = node.strokeAlign === 'CENTER' ? 0.5 : 1; // OUTSIDE gets the full weight

    if (node.strokeWeight === figma.mixed) {
        if (!('strokeTopWeight' in node)) return zero;

        return {
            top: node.strokeTopWeight * multiplier,
            right: node.strokeRightWeight * multiplier,
            bottom: node.strokeBottomWeight * multiplier,
            left: node.strokeLeftWeight * multiplier,
        };
    }

    const weight = node.strokeWeight * multiplier;
    return { top: weight, right: weight, bottom: weight, left: weight };
}
