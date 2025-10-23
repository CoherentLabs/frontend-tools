import { getNodes } from '../../exporter';
import { FrameAndGroup } from '../../types/commonTypes';
import { BACKGROUND_SUFFIX } from '../../utils/constants';
import GFBaseNode from '../BaseNode';

class GFFrame extends GFBaseNode {
    public html: string;

    constructor(node: FrameAndGroup) {
        super(node as FrameNode);
        this.html = '';
    }

    async init() {
        const { html, css, images } = await getNodes((this.node as FrameNode).children);
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
