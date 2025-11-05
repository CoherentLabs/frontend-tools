import { PrimitiveNodes } from '../../types/commonTypes';
import { getPercentage } from '../../utils/convertUnits';
import getParentSize from '../../utils/parentSize';

export function generatePosition(node: PrimitiveNodes): { left: string; top: string } {
    let { x, y } = node;
    const { parent } = node;

    if (!parent) return { left: `0%`, top: `0%` };

    if (parent.type === 'PAGE') return { left: `0%`, top: `0%` };

    const { width, height } = getParentSize(parent);

    if (parent.type === 'GROUP') {
        x -= parent.x;
        y -= parent.y;
    }

    return {
        left: `${getPercentage(x, width)}%`,
        top: `${getPercentage(y, height)}%`,
    };
}
