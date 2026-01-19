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
    const gap = calculateGap(node);
    let flex = '0 1 auto';

    if (node.layoutSizingHorizontal === 'FILL' || node.layoutSizingVertical === 'FILL') {
        flex = '1 1 auto';
    }

    return {
        alignSelf,
        gap,
        flex,
    };
}

export function calculateGap(node: AvailableNode): string {
    let gap = '0';
    if (!node.parent || !('itemSpacing' in node.parent)) {
        return gap;
    }

    gap = `${convertPXtoVH(node.parent.itemSpacing)}vh`;

    return gap;
}
