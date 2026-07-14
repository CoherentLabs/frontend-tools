import { AvailableNode, FlexContainerStyles, FlexItemStyles } from '../../types/commonTypes';
import { convertPXtoVH } from '../../utils/convertUnits';

const justifyContentRecord: Record<AutoLayoutMixin['primaryAxisAlignItems'], string> = {
    MIN: 'flex-start',
    CENTER: 'center',
    MAX: 'flex-end',
    SPACE_BETWEEN: 'space-between',
};

const alignItemsRecord: Record<AutoLayoutMixin['counterAxisAlignItems'], string> = {
    MIN: 'flex-start',
    CENTER: 'center',
    MAX: 'flex-end',
    BASELINE: 'baseline',
};

const alignContentRecord: Record<AutoLayoutMixin['counterAxisAlignContent'], string> = {
    AUTO: 'stretch',
    SPACE_BETWEEN: 'space-between',
};

export function generateFlexContainerStyles(node: FrameNode | ComponentNode | InstanceNode): FlexContainerStyles {
    const direction = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
    const wrap = node.layoutWrap === 'WRAP' ? 'wrap' : 'nowrap';

    let justifyContent = justifyContentRecord[node.primaryAxisAlignItems];
    if (!justifyContent) {
        justifyContent = 'flex-start';
    }

    let alignItems = alignItemsRecord[node.counterAxisAlignItems];
    if (!alignItems || alignItems === 'baseline') {
        //No support for baseline in Gameface
        alignItems = 'flex-start';
    }

    // For alignContent, we need to check if the node has wrapping enabled
    let alignContent = alignContentRecord[node.counterAxisAlignContent];
    if (wrap === 'nowrap' || !alignContent) {
        alignContent = 'stretch';
    }

    return {
        direction,
        wrap,
        justifyContent,
        alignItems,
        alignContent,
    };
}

const layoutAlignRecord: Record<LayoutMixin['layoutAlign'], string> = {
    INHERIT: 'auto',
    STRETCH: 'stretch',
    MIN: 'flex-start',
    CENTER: 'center',
    MAX: 'flex-end',
};

export function generateFlexItemStyles(node: AvailableNode): FlexItemStyles {
    const alignSelf = layoutAlignRecord[node.layoutAlign] || 'auto';
    // layoutGrow (0/1) is Figma's own pre-resolved "stretch along the parent's main axis" flag —
    // already axis-correct regardless of row/column direction, unlike layoutSizingHorizontal/Vertical
    // (which conflate both axes and would apply grow/shrink to the wrong one). A FIXED-size main-axis
    // child never shrinks in Figma (it just overflows), so flex-shrink is 0 there; a FILL child can
    // shrink below its content size, so grow and shrink are both 1.
    const flex = node.layoutGrow === 1 ? '1 1 auto' : '0 0 auto';

    return {
        alignSelf,
        flex,
    };
}

export function calculateGap(node: AvailableNode): string {
    let gap = '0';
    if (!node.parent || !('itemSpacing' in node.parent)) {
        return gap;
    }

    gap = `${convertPXtoVH(node.parent.itemSpacing).toFixed(2)}vh`;

    return gap;
}

// Spacing between wrapped lines (Figma's counterAxisSpacing) is a separate value from itemSpacing
// (the main-axis gap) and can be zero even when itemSpacing isn't — it must not be assumed equal to it.
export function calculateCounterAxisGap(node: AvailableNode): string {
    let gap = '0';
    if (!node.parent || !('counterAxisSpacing' in node.parent) || node.parent.counterAxisSpacing === null) {
        return gap;
    }

    gap = `${convertPXtoVH(node.parent.counterAxisSpacing).toFixed(2)}vh`;

    return gap;
}

export function isNegativeGap(gap: string): boolean {
    return gap.startsWith('-');
}

export function isFirstFlexChild(node: AvailableNode): boolean {
    return !!node.parent && 'children' in node.parent && node.parent.children[0] === node;
}

// Figma clamps a negative gap to the smallest child in the whole auto-layout container (along the
// relevant axis) — an extreme negative itemSpacing (however large) still just overlaps everything onto
// that smallest item, never further. Includes every child, including the first (it never gets a margin
// itself, but its size still counts toward the container-wide minimum).
export function getMinChildSizeVh(parent: FrameNode | ComponentNode | InstanceNode, axis: 'width' | 'height'): number {
    if (!('children' in parent) || parent.children.length === 0) return 0;

    const sizes = parent.children
        .filter((child): child is AvailableNode => 'width' in child && 'height' in child)
        .map((child) => convertPXtoVH(child[axis]));

    if (sizes.length === 0) return 0;

    return Math.min(...sizes);
}

// `gap` and `minSiblingSizeVh` must already be in the same unit (vh) — see getMinChildSizeVh.
export function clampNegativeGap(gap: string, minSiblingSizeVh: number): string {
    const gapValue = parseFloat(gap);
    const clamped = Math.max(gapValue, -minSiblingSizeVh);
    return `${clamped.toFixed(2)}vh`;
}
