import {  PrimitiveNodes } from '../../types/commonTypes';
import { getPercentage } from '../../utils/convertUnits';
import getMaskedBy from '../../utils/getMaskedBy';
import getParentSize from '../../utils/parentSize';

export async function generatePosition(node: PrimitiveNodes): Promise<{ left: string; top: string }> {
    const parent = node.parent;

    // Return default position if no parent or parent is page
    if (!parent || parent.type === 'PAGE') {
        return { left: '0%', top: '0%' };
    }

    const position = await getAdjustedPosition(node);
    const dimensions = await getEffectiveDimensions(node, parent as SceneNode);

    return {
        left: getPercentage(position.x, dimensions.width) + '%',
        top: getPercentage(position.y, dimensions.height) + '%',
    };
}

async function getAdjustedPosition(node: PrimitiveNodes): Promise<{ x: number; y: number }> {
    let x = node.x;
    let y = node.y;
    const parent = node.parent;

    // Apply mask position adjustments
    const maskOffset = await getMaskOffset(node);
    if (maskOffset) {
        x -= maskOffset.x;
        y -= maskOffset.y;

        return { x, y };
    }

    // Handle group positioning
    if (parent && parent.type === 'GROUP') {
        const adjusted = await adjustForGroup(x, y, parent as SceneNode);
        x = adjusted.x;
        y = adjusted.y;
    }

    return { x, y };
}

async function getMaskOffset(node: PrimitiveNodes): Promise<{ x: number; y: number } | null> {
    const maskedBy = await getMaskedBy(node);

    if (!maskedBy) {
        return null;
    }
    //@ts-expect-error x and y exist on SceneNode
    const maskX = maskedBy.x;
    //@ts-expect-error x and y exist on SceneNode
    const maskY = maskedBy.y;

    if (isValidNumber(maskX) && isValidNumber(maskY)) {
        return { x: maskX, y: maskY };
    }

    return null;
}

async function adjustForGroup(x: number, y: number, parent: SceneNode): Promise<{ x: number; y: number }> {
    const adjustedX = x - parent.x;
    const adjustedY = y - parent.y;

    return { x: adjustedX, y: adjustedY };
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

    if (maskedBy) {
        width = maskedBy.width || width;
        height = maskedBy.height || height;
    }

    return { width, height };
}

function isValidNumber(value: number): boolean {
    return !isNaN(value) && isFinite(value);
}
