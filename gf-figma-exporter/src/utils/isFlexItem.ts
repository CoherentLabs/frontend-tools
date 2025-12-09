import { AvailableNode } from "../types/commonTypes";

export default function isFlexItem(node: AvailableNode): boolean {
    if (
        !('parent' in node) ||
        !node.parent ||
        (node.parent &&
            (node.parent.type === 'FRAME' || node.parent.type === 'INSTANCE') &&
            node.parent.layoutMode === 'NONE')
    )
        return false;
    return true;
}
