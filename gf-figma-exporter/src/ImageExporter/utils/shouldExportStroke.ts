import { NodesWithFillsAndStrokes } from '../../types/commonTypes';
import isBasicStroke from '../../utils/isStrokeBasic';

export default function shouldExportStroke(node: NodesWithFillsAndStrokes): boolean {
    let result = false;

    if (!node.strokes) return result;

    if (node.strokes.length === 0) return result;

    if (node.strokes.every((stroke) => stroke.visible === false)) return result;

    if (node.cornerRadius === figma.mixed || node.cornerRadius > 0) result = true;

    if (node.dashPattern.length > 0) result = true;

    if (node.strokes.length > 1) result = true;

    if (node.type === 'ELLIPSE') result = true;

    if (!isBasicStroke(node)) result = true;

    if (node.strokes[0].type !== 'GRADIENT_LINEAR' && node.strokes[0].type !== 'SOLID') result = true;

    return result;
}
