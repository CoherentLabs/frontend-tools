import { AvailableNode } from '../types/commonTypes';

export default function getMaskBoundingBox(
    node: AvailableNode
): { x: number; y: number; width: number; height: number } | null {
    if (!node.isMask) {
        return null;
    }

    return node.absoluteBoundingBox || null;
}
