import { AvailableNode } from '../../types/commonTypes';
import { convertPXtoVH } from '../../utils/convertUnits';

export function generateSize(node: AvailableNode): { width: string; height: string } {
    const width = `${convertPXtoVH(node.width).toFixed(2)}vh`;
    const height = `${convertPXtoVH(node.height).toFixed(2)}vh`;

    return {
        width,
        height,
    };
}

export function generateFlexSize(node: AvailableNode): { width: string; height: string } {
    let width = `${convertPXtoVH(node.width).toFixed(2)}vh`;
    let height = `${convertPXtoVH(node.height).toFixed(2)}vh`;

    if (node.type === 'FRAME' || node.type === 'INSTANCE') {
        if (node.layoutSizingHorizontal === 'HUG') {
            width = 'auto';
        }
        if (node.layoutSizingVertical === 'HUG') {
            height = 'auto';
        }
    }

    return {
        width,
        height,
    };
}
