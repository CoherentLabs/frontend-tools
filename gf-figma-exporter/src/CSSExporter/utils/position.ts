import { PrimitiveNodes } from '../../types/commonTypes';
import { getPercentage } from '../../utils/convertUnits';
import getParentSize from '../../utils/parentSize';

export function generatePosition(node: PrimitiveNodes): { left: string; top: string } {
    const { x, y, parent } = node;

    if (!parent || parent.type === 'PAGE') return { left: `0%`, top: `0%` };

    const { width, height } = getParentSize(parent);

    return {
        left: `${getPercentage(x, width)}%`,
        top: `${getPercentage(y, height)}%`,
    };
}
