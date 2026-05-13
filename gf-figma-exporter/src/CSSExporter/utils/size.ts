import { AvailableNode } from '../../types/commonTypes';
import { convertPXtoVH } from '../../utils/convertUnits';
import getMaskBoundingBox from '../../utils/getMaskBoundingBox';

export function generateSize(node: AvailableNode): { width: string; height: string } {
    const width = `${convertPXtoVH(node.width).toFixed(2)}`;
    const height = `${convertPXtoVH(node.height).toFixed(2)}`;

    if (node.isMask) {
        const maskBoundingBox = getMaskBoundingBox(node);

        if (maskBoundingBox) {
            return {
                width: convertPXtoVH(maskBoundingBox.width).toFixed(2),
                height: convertPXtoVH(maskBoundingBox.height).toFixed(2),
            };
        }
    }

    return {
        width,
        height,
    };
}

export async function generateFlexSize(node: AvailableNode): Promise<{ width: string; height: string }> {
    let width = '100%';
    let height = '100%';

    if (node.type === 'FRAME' || node.type === 'INSTANCE' || node.type === 'COMPONENT') {
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
