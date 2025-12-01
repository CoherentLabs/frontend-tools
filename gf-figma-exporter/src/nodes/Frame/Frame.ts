import { getNodes } from '../../exporter';
import { ExportableNodes, FrameAndGroup, MaskNode } from '../../types/commonTypes';
import { BACKGROUND_SUFFIX } from '../../utils/constants';
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
        
        const maskIndexes = getMaskIndexes(this.node.children as ExportableNodes[]);
        if (maskIndexes.length === 0) return;

        let currentIndex = -1;

        this.modifiedChildren = (this.node.children as ExportableNodes[]).reduce(
            (nodes: ExportableNodes[], child: ExportableNodes, index: number) => {
                if (index < maskIndexes[0]) {
                    nodes.push(child);
                    return nodes;
                }

                if (maskIndexes.includes(index)) {
                    const maskNode = createMaskNode(child);
                    nodes.push(maskNode as ExportableNodes);
                    currentIndex = index;
                    return nodes;
                }

                if (index > currentIndex && nodes.length > 0) {
                    const lastNode = nodes[nodes.length - 1] as MaskNode;
                    (child as SceneNode).setPluginData('masked-by', lastNode.id);
                    lastNode.maskChildren.push(child);
                    return nodes;
                }

                return nodes;
            },
            [] as ExportableNodes[]
        );
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
            ${this.html}
        </div>`;
    }
}

export default GFFrame;
