import { AvailableNode, NodesWithFillsAndStrokes } from '../../types/commonTypes';
import { convertPXtoVH } from '../../utils/convertUnits';
import { generateBackgroundRect } from './background';

export function generateSize(node: AvailableNode): { width: string; height: string } {
    const width = `${convertPXtoVH(node.width).toFixed(2)}vh`;
    const height = `${convertPXtoVH(node.height).toFixed(2)}vh`;

    return {
        width,
        height,
    };
}

export async function generateFlexSize(node: AvailableNode): Promise<{ width: string; height: string }> {
    let { width, height} = await generateBackgroundRect(node as NodesWithFillsAndStrokes);

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
