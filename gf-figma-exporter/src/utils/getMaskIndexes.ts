import { ExportableNodes } from "../types/commonTypes";

export default function getMaskIndexes(nodes: ExportableNodes[]): number[] {
    return nodes
        .reduce((indexes: number[], node: ExportableNodes, index: number) => {
            // A frame only breaks mask propagation if it clips its own content — that establishes its
            // own independent clip boundary that a preceding mask can't reach through. A frame without
            // clipsContent is just a transparent layout wrapper (like a Group) and should be maskable
            // like any other sibling, so masking still propagates into/through it.
            const isClippingFrame = node.type === 'FRAME' && node.clipsContent;
            if (node.isMask || isClippingFrame) {
                indexes.push(index);
            }
            return indexes;
        }, []);
}
