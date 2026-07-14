import { AvailableNode } from '../types/commonTypes';

export default function isFlexItem(node: AvailableNode): boolean {
    if (!node) return false;
    if (!node.parent) return false;
    if (node.parent.type !== 'FRAME' && node.parent.type !== 'INSTANCE' && node.parent.type !== 'COMPONENT') return false;
    if (node.parent.layoutMode === 'NONE') return false;

    // A node captured into a mask's maskChildren (see configureMaskNodes in Frame.ts) is rendered
    // nested inside the mask's own plain, non-flex wrapping div (Mask.ts) — not as a direct child of
    // the flex container — even though its real Figma parent is still the auto-layout frame. Flex-item
    // styling (position:relative, align-self, and especially the negative-gap margin-overlap
    // simulation) is meaningless there and would overwrite the mask-aware absolute position
    // generatePosition() already computes for it.
    if ('getPluginData' in node && node.getPluginData('masked-by') !== '') return false;

    return true;
}
