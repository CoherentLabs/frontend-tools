import { convertPXtoVH } from "../../utils/convertUnits";

export function generateSize(node :{width: number, height: number}): { width: string; height: string } {
    return {
        width: `${convertPXtoVH(node.width).toFixed(2)}vh`,
        height: `${convertPXtoVH(node.height).toFixed(2)}vh`
    };
}