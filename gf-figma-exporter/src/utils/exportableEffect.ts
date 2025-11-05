import { PrimitiveNodes, SVGNodes } from '../types/commonTypes';
import isNodeSVG from './isNodeSVG';

export default function getExportableEffects(node: SVGNodes | PrimitiveNodes): Effect[] {
    if (!node.effects || node.effects.length === 0) return [];

    return node.effects.filter((effect) => {
        return (
            effect.visible &&
            ((effect.type === 'INNER_SHADOW' && isNodeSVG(node)) ||
                (effect.type === 'LAYER_BLUR' && effect.blurType === 'PROGRESSIVE'))
        );
    });
}
