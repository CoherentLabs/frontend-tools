import { ExportableNodes } from "../types/commonTypes";

export default async function getMaskedBy(node: ExportableNodes): Promise<ExportableNodes | null> {
    const isMasked = (node as SceneNode).getPluginData('masked-by');
    if (!isMasked) return null;

    const maskedByNode = await figma.getNodeByIdAsync(isMasked);
    if (!maskedByNode) return null;

    return maskedByNode as ExportableNodes;
}