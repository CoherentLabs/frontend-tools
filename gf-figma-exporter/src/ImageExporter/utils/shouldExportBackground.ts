import { SPECIAL_FILL_TYPES } from "../../CSSExporter/utils/background";
import hasImage from "../../utils/hasImage";

export default function shouldExportBackground(fills: readonly Paint[] | PluginAPI["mixed"]): boolean {
    let result = true;

    if (!fills || fills === figma.mixed) result = false;

    const specialFillsCount = (fills as readonly Paint[]).filter((fill: Paint) => SPECIAL_FILL_TYPES.includes(fill.type) && fill.visible).length;
    if (specialFillsCount === 1) result = false;

    if (!hasImage(fills)) result = false;

    return result;
}