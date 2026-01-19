import { ExportableNodes } from '../types/commonTypes';

export default async function getMaskedBy(node: ExportableNodes): Promise<ExportableNodes | null> {
    const traverseUp = (traversedNode: SceneNode) => {
        if (!traversedNode) return null;
    
        
        if (traversedNode.getPluginData('masked-by')) {
            return traversedNode.getPluginData('masked-by');
        }

        return traverseUp(traversedNode.parent as SceneNode);
    };

    const maskID = traverseUp(node as SceneNode);
    if (!maskID) return null;

    const maskedByNode = await figma.getNodeByIdAsync(maskID);
    if (!maskedByNode) return null;

    return maskedByNode as ExportableNodes;
}
