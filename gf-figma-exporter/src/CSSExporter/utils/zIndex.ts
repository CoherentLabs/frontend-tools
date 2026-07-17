import { PrimitiveNodes } from "../../types/commonTypes";
import getNestedLevel from "../../utils/getNestedLevel";

// Wide enough that a per-sibling stacking bump (see getSiblingStackingBump) can never spill into the
// next nesting level's range, even for an auto-layout container with hundreds of children.
const LEVEL_SPACING = 1000;

export function generateZIndex(node: PrimitiveNodes): number {
    return getNestedLevel(node) * LEVEL_SPACING + getSiblingStackingBump(node);
}

// Figma auto-layout containers have a "Canvas stacking" setting (itemReverseZIndex) controlling
// whether earlier or later children in the layer list paint on top of their siblings. All siblings at
// the same nesting depth otherwise share the same base z-index, so their relative order would rely on
// implicit HTML/DOM-order tie-breaking (which always matches Figma's default "Last on top" and can't be
// reversed). This makes that ordering explicit instead, so it can also be flipped when needed.
function getSiblingStackingBump(node: PrimitiveNodes): number {
    const parent = node.parent;
    if (!parent || !('children' in parent) || !('itemReverseZIndex' in parent)) return 0;

    const siblings = parent.children;
    const index = siblings.indexOf(node as unknown as SceneNode);
    if (index === -1) return 0;

    return parent.itemReverseZIndex ? siblings.length - 1 - index : index;
}
