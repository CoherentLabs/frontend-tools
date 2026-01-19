import { SVGNodes } from '../types/commonTypes';

/**
 * Combine fillGeometry + strokeGeometry into a single SVG path string (d attribute).
 * Never exports SVG, so image fills won't matter.
 */
export function combineFillAndStrokeToPathData(node: SVGNodes): string {
    const fillPaths = node.fillGeometry || [];
    const strokePaths = node.strokeGeometry || [];

    const allPaths = [...fillPaths, ...strokePaths];

    return allPaths.reduce((acc, path) => {
        acc += path.data + ' ';
        return acc;
    }, '').trim();   
}
