import { ExportableNodes } from "../types/commonTypes";

export default function getMaskIndexes(nodes: ExportableNodes[]): number[] {
    return nodes
        .reduce((indexes: number[], node: ExportableNodes, index: number) => {
            if (node.isMask || node.type === 'FRAME') {
                indexes.push(index);
            }
            return indexes;
        }, []);
}
