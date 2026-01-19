import { Paddings } from "../../types/commonTypes";
import { convertPXtoVH } from "../../utils/convertUnits";

export function generatePaddings(node: FrameNode | InstanceNode): Paddings {
    const paddingTop = convertPXtoVH(node.paddingTop);
    const paddingBottom = convertPXtoVH(node.paddingBottom);
    const paddingLeft = convertPXtoVH(node.paddingLeft);
    const paddingRight = convertPXtoVH(node.paddingRight);

    return {
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
    };
}