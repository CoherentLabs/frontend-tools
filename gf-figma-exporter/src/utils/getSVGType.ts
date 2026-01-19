import { SPECIAL_FILL_TYPES } from "../CSSExporter/utils/background";
import { SVGNodes } from "../types/commonTypes";
import hasImage from "./hasImage";

export default function getSVGType(node: SVGNodes): 'SVG' | 'IMAGE' {
    if (!node.fills || node.fills === figma.mixed) return 'IMAGE';

    if (hasImage(node.fills)) return 'IMAGE';
    if (hasImage(node.strokes)) return 'IMAGE';

    if (node.strokes.some(stroke => SPECIAL_FILL_TYPES.includes(stroke.type) && stroke.visible)) return 'IMAGE';
    if (node.fills.some(fill => SPECIAL_FILL_TYPES.includes(fill.type) && fill.visible)) return 'IMAGE';
    
    return 'SVG';
}
