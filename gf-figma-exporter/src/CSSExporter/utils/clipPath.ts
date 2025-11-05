import { SVGNodes } from '../../types/commonTypes';
import { getPercentage } from '../../utils/convertUnits';
import flattenSVGPath from '../../utils/flattenSVGPath';

export async function createClipPath(node: SVGNodes): Promise<string | null> {
    const { fillGeometry } = node;

    if (!fillGeometry || fillGeometry.length === 0) return null;

    const polygon = await flattenPathToPolygons(fillGeometry[0].data, node.width, node.height);

    if (!polygon) return null;

    return `polygon(${polygon})`;
}

async function flattenPathToPolygons(path: string, width: number, height: number): Promise<string> {
    const points = await flattenSVGPath(path, width, height, 1);
    if (points.length === 0) return '';

    const polygon = points
        .map((point) => {
            return `${getPercentage(point.x, width).toFixed(2)}%,${getPercentage(point.y, height).toFixed(2)}%`;
        })
        .join(' ');

    return polygon;
}
