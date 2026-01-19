import { AvailableNode, PrimitiveNodes } from '../../types/commonTypes';
import { getPercentage } from '../../utils/convertUnits';
import getMaskBoundingBox from '../../utils/getMaskBoundingBox';
import getMaskedBy from '../../utils/getMaskedBy';
import getParentSize from '../../utils/parentSize';
import { getRelativeCssTransform } from '../../utils/transformUtils';

export async function generatePosition(node: PrimitiveNodes): Promise<{ left: string; top: string }> {
    const parent = node.parent;

    // Return default position if no parent or parent is page
    if (!parent || parent.type === 'PAGE') {
        return { left: '0%', top: '0%' };
    }

    const position = await getAdjustedPosition(node);
    const dimensions = await getEffectiveDimensions(node, parent as SceneNode);

    return {
        left: getPercentage(position.x, dimensions.width).toFixed(2) + '%',
        top: getPercentage(position.y, dimensions.height).toFixed(2) + '%',
    };
}

async function getAdjustedPosition(node: PrimitiveNodes): Promise<{ x: number; y: number }> {
    const parent = node.parent as AvailableNode | null;
    const nodeBoundingBox = node.absoluteBoundingBox!;

    let {x, y} = getRelativeCssTransform(node, parent!);
    

    if (!parent) {
        return { x, y };
    }
    
    if (node.isMask) {
        const parentBoundingBox = parent.absoluteBoundingBox!;
        x = nodeBoundingBox.x - parentBoundingBox.x;
        y = nodeBoundingBox.y - parentBoundingBox.y;
    }

    // If the node is masked, adjust position accordingly
    const maskOffset = await getMaskOffset(node);
    if (maskOffset) {
        x = nodeBoundingBox.x - maskOffset.x;
        y = nodeBoundingBox.y - maskOffset.y;
    }

    return { x, y };
}

async function getMaskOffset(node: PrimitiveNodes): Promise<{ x: number; y: number } | null> {
    if (node.getPluginData('masked-by') === '') {
        return null;
    }

    const maskedBy = await getMaskedBy(node);

    if (!maskedBy) {
        return null;
    }

    const maskBoundingBox = getMaskBoundingBox(maskedBy as AvailableNode);

    if (!maskBoundingBox) {
        return null;
    }


    return { x: maskBoundingBox.x, y: maskBoundingBox.y };
}

async function getEffectiveDimensions(
    node: PrimitiveNodes,
    parent: SceneNode
): Promise<{ width: number; height: number }> {
    const parentSize = getParentSize(parent);
    let width = parentSize.width;
    let height = parentSize.height;

    // Use mask dimensions if available
    const maskedBy = await getMaskedBy(node);


    if (maskedBy && node.getPluginData('masked-by') !== '') {
        const maskBoundingBox = getMaskBoundingBox(maskedBy as AvailableNode);

        if (!maskBoundingBox) {
            return { width, height };
        }
        width = maskBoundingBox.width;
        height = maskBoundingBox.height;
    }

    return { width, height };
}
