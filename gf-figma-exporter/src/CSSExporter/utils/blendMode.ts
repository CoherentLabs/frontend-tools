import { AvailableNode } from "../../types/commonTypes";

export function generateBlendMode(node: AvailableNode): string {
    switch (node.blendMode) {
        case 'PASS_THROUGH':
            return 'normal';
        case 'NORMAL':
            return 'normal';
        default:
            return node.blendMode.toLowerCase();
    }
}
