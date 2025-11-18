import { PrimitiveNodes } from '../../types/commonTypes';
import { getPercentage } from '../../utils/convertUnits';
import getParentSize from '../../utils/parentSize';

export function generatePosition(node: PrimitiveNodes): { left: string; top: string } {
    let { x, y } = node;
    const { parent } = node;

    if (!parent || parent.type === 'PAGE') return { left: `0%`, top: `0%` };

    const { width, height } = getParentSize(parent);

    if (parent.type === 'GROUP') { // Groups have the top Frame as their origin not their parent
        x -= parent.x;
        y -= parent.y;
    }

    return {
        left: `${getPercentage(x, width)}%`,
        top: `${getPercentage(y, height)}%`,
    };
}
