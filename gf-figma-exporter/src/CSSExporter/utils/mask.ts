import { ExportableNodes } from "../../types/commonTypes";
import generateImageName from "../../utils/generateImageName";

export function generateMaskStyle(node: ExportableNodes): string {
    return `./${generateImageName(node.name, node.id, 'full')}`;
}