import { convertPXtoVH } from "../../utils/convertUnits";

export function generateSize(node: ExportableNodes): { width: string; height: string } {
    return {
        width: `${convertPXtoVH(node.width).toFixed(2)}vh`,
        height: `${convertPXtoVH(node.height).toFixed(2)}vh`
    };
}