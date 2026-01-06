import { AvailableNode } from '../types/commonTypes';

export default function isFlexItem(node: AvailableNode): boolean {
    if (!node) return false;
    if (!node.parent) return false;
    if (node.parent.type !== 'FRAME' && node.parent.type !== 'INSTANCE') return false;
    if (node.parent.layoutMode === 'NONE') return false;
    return true;
}
