import { PrimitiveNodes } from '../../types/commonTypes';
import { getPercentage } from '../../utils/convertUnits';
import getParentSize from '../../utils/parentSize';

export function generatePosition(node: PrimitiveNodes): { left: string; top: string } {
    const parent = node.parent;
    
    // Return default position if no parent or parent is page
    if (!parent || parent.type === 'PAGE') {
        return { left: '0%', top: '0%' };
    }

    const position = getAdjustedPosition(node);
    const dimensions = getEffectiveDimensions(node, (parent as SceneNode));

    return {
        left: getPercentage(position.x, dimensions.width) + '%',
        top: getPercentage(position.y, dimensions.height) + '%',
    };
}

function getAdjustedPosition(node: PrimitiveNodes): { x: number; y: number } {
    let x = node.x;
    let y = node.y;
    const parent = node.parent;

    // Apply mask position adjustments
    const maskOffset = getMaskOffset(node);
    if (maskOffset) {
        x -= maskOffset.x;
        y -= maskOffset.y;
    }

    // Handle group positioning
    if (parent && parent.type === 'GROUP') {
        const adjusted = adjustForGroup(x, y, parent);
        x = adjusted.x;
        y = adjusted.y;
    }

    return { x: x, y: y };
}

function getMaskOffset(node: PrimitiveNodes): { x: number; y: number } | null {
    const maskX = parseFloat(node.getPluginData('mask-x'));
    const maskY = parseFloat(node.getPluginData('mask-y'));

    if (isValidNumber(maskX) && isValidNumber(maskY)) {
        return { x: maskX, y: maskY };
    }

    return null;
}

function adjustForGroup(x: number, y: number, parent: SceneNode): { x: number; y: number } {
    let adjustedX = x - parent.x;
    let adjustedY = y - parent.y;

    // Apply parent mask adjustments if inside mask
    if (parent.getPluginData('is-inside-mask') === 'true') {
        const parentMaskOffset = getParentMaskOffset(parent);
        if (parentMaskOffset) {
            adjustedX -= parentMaskOffset.x;
            adjustedY -= parentMaskOffset.y;
        }
    }

    return { x: adjustedX, y: adjustedY };
}

function getParentMaskOffset(parent: SceneNode): { x: number; y: number } | null {
    const parentMaskX = parseFloat(parent.getPluginData('mask-x'));
    const parentMaskY = parseFloat(parent.getPluginData('mask-y'));

    if (isValidNumber(parentMaskX) && isValidNumber(parentMaskY)) {
        return { x: parentMaskX, y: parentMaskY };
    }

    return null;
}

function getEffectiveDimensions(node: PrimitiveNodes, parent: SceneNode): { width: number; height: number } {
    const parentSize = getParentSize(parent);
    let width = parentSize.width;
    let height = parentSize.height;

    // Use mask dimensions if available
    const maskWidth = parseFloat(node.getPluginData('mask-width'));
    const maskHeight = parseFloat(node.getPluginData('mask-height'));

    if (isValidNumber(maskWidth) && isValidNumber(maskHeight)) {
        width = maskWidth;
        height = maskHeight;
    }

    return { width: width, height: height };
}

function isValidNumber(value: number): boolean {
    return !isNaN(value) && isFinite(value);
}
