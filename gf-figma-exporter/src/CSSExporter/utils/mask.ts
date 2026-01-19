import { ExportableNodes } from '../../types/commonTypes';
import generateImageName from '../../utils/generateImageName';
import { NodesWithFillsAndStrokes } from '../../types/commonTypes';
import getPathBBox from '../../utils/getPathBBox';
import { getPercentage } from '../../utils/convertUnits';

export function generateMaskStyle(node: ExportableNodes): string {
    return `./${generateImageName(node.name, node.id, 'full')}`;
}

export async function getMaskPosition(
    node: NodesWithFillsAndStrokes
): Promise<{ x: number; y: number; width: string; height: string }> {
    const { fillGeometry } = node;

    let x = 0;
    let y = 0;
    let width = '100%';
    let height = '100%';

    // If there is no fillGeometry or it's empty, return a sensible default rect
    if (!fillGeometry || fillGeometry.length === 0) {
        return { x, y, width, height };
    }

    const bbox = await getPathBBox(fillGeometry[0].data);

    if (!bbox) {
        return { x, y, width, height };
    }


    x = getPercentage(bbox.x, node.width);
    y = getPercentage(bbox.y, node.height);
    width = getPercentage(bbox.width, node.width).toFixed(2);
    height = getPercentage(bbox.height, node.height).toFixed(2);

    x = calculateMaskPos(x, parseFloat(width));
    y = calculateMaskPos(y, parseFloat(height));

    return {
        x,
        y,
        width,
        height,
    };
}

function calculateMaskPos(position: number, maskDimension: number ): number {
    if (maskDimension >= 100) {
        return 0;
    }
    return (position / (100 - maskDimension)) * 100
}