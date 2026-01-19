import { AvailableNode } from "../types/commonTypes";

export function isAutoLayoutNode(node: AvailableNode): boolean {
    return 'layoutMode' in node && node.layoutMode !== 'NONE';
}

export function isAutoLayoutItem(node: AvailableNode): boolean {
    return node.parent !== null && 'layoutAlign' in node.parent && node.parent.layoutAlign !== 'INHERIT';
}