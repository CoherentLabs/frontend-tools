import { SPECIAL_FILL_TYPES } from "../../CSSExporter/utils/background";
import { NodesWithFillsAndStrokes, SVGNodes } from "../../types/commonTypes";
import getExportableEffects from "../../utils/exportableEffect";
import hasImage from "../../utils/hasImage";

export default function shouldExportBackground(node: SVGNodes | NodesWithFillsAndStrokes): boolean {
    const { fills } = node;

    let result = false;

    if (!fills || fills === figma.mixed) return result;

    if (fills.length === 0) return result;

    if (fills.every((fill) => fill.visible === false)) return result;

    const solidFills = (fills as readonly Paint[]).filter((fill) => fill.type === 'SOLID' && fill.visible).length;
    if (solidFills > 1) result = true;

    const specialFillsCount = (fills as readonly Paint[]).filter((fill: Paint) => SPECIAL_FILL_TYPES.includes(fill.type) && fill.visible).length;
    if (specialFillsCount > 1) result = true;

    if (hasImage(fills)) result = true;

    const imageEffects = getExportableEffects(node);
    if (imageEffects.length > 0) result = true;

    return result;
}