import { getNodes } from '../../exporter';
import { ExportableNodes, FrameAndGroup, MaskNode } from '../../types/commonTypes';
import { BACKGROUND_SUFFIX, FLEX_SUFFIX } from '../../utils/constants';
import createMaskNode from '../../utils/createMaskNode';
import getMaskIndexes from '../../utils/getMaskIndexes';
import GFBaseNode from '../BaseNode';

class GFFrame extends GFBaseNode {
    public html: string;
    public modifiedChildren: ExportableNodes[];

    constructor(node: FrameAndGroup) {
        super(node as FrameNode);
        this.html = '';
        this.modifiedChildren = [];
    }

    configureMaskNodes() {
        if (!('children' in this.node) || this.node.children.length === 0) return;

        // Clear any existing plugin data from previous runs
        (this.node.children as SceneNode[]).forEach((child) => {
            if ('setPluginData' in child) {
                child.setPluginData('masked-by', '');
            }
        });

        // A mask must be the back-most (first-painted) layer among the siblings it masks — it masks
        // whatever paints in front of it. Default Canvas stacking paints low array index first (furthest
        // back), so masking propagates toward higher indices, matching plain array order below. Reversed
        // Canvas stacking (itemReverseZIndex) flips which end paints first (and correspondingly flips the
        // layers panel display), so the propagation direction must flip too — run the same algorithm on
        // a reversed copy of the children, then reverse the result back so the exported DOM order still
        // matches the live Figma array (z-index, not DOM order, is what establishes final visual
        // stacking — see getSiblingStackingBump in CSSExporter/utils/zIndex.ts).
        const isReversedStacking = 'itemReverseZIndex' in this.node && this.node.itemReverseZIndex;
        const orderedChildren = isReversedStacking
            ? [...(this.node.children as ExportableNodes[])].reverse()
            : (this.node.children as ExportableNodes[]);

        const maskIndexes = getMaskIndexes(orderedChildren);
        if (maskIndexes.length === 0) return;

        let currentIndex = -1;

        const modifiedChildren = orderedChildren.reduce(
            (nodes: ExportableNodes[], child: ExportableNodes, index: number) => {
                if (index < maskIndexes[0]) {
                    nodes.push(child);
                    return nodes;
                }

                if (maskIndexes.includes(index)) {
                    if (child.type === 'FRAME' && !child.isMask) {
                        nodes.push(child);
                    } else {
                        const maskNode = createMaskNode(child);
                        nodes.push(maskNode as ExportableNodes);
                    }
                    currentIndex = index;
                    return nodes;
                }

                if (index > currentIndex && nodes.length > 0) {
                    const lastNode = nodes[nodes.length - 1] as MaskNode;

                    if (lastNode.type !== 'MASK') {
                        nodes.push(child);
                        return nodes;
                    }

                    (child as SceneNode).setPluginData('masked-by', lastNode.id);
                    lastNode.maskChildren.push(child);
                    return nodes;
                }

                return nodes;
            },
            [] as ExportableNodes[]
        );

        this.modifiedChildren = isReversedStacking ? modifiedChildren.reverse() : modifiedChildren;
    }

    async init() {
        this.configureMaskNodes();
        const { html, css, images } = await getNodes(
            this.modifiedChildren.length > 0
                ? this.modifiedChildren
                : 'children' in this.node
                ? (this.node.children as ExportableNodes[])
                : []
        );
        this.html = html;
        this.additionalCSS = css;
        this.images = this.images.concat(images);
    }

    async createHTML(): Promise<string> {
        return `<div class="${this.className}">
            <div class="${this.className}${BACKGROUND_SUFFIX}"></div>
            ${this.isAutoLayout ? `<div class="${this.className}${FLEX_SUFFIX}">` : ''}
            ${this.html}
            ${this.isAutoLayout ? `</div>` : ''}
        </div>`;
    }
}

export default GFFrame;
