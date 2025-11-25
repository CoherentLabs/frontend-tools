import { ExportableNodes } from "../types/commonTypes";

export default function getMaskIndexes(nodes: ExportableNodes[]): number[] {
    return nodes
        .map((node) => 'isMask' in node ? node.isMask : false)
        .reduce((indexes: number[], isMask: boolean, index: number) => {
            if (isMask) {
                indexes.push(index);
            }
            return indexes;
        }, []);
}
