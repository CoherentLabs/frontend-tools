import { getNodes } from "../../exporter";
import { GFImage } from "../../types/commonTypes";
import hasImage from "../../utils/hasImage";
import GFBaseNode from "../BaseNode";
import { generateAdditionalStyles, generateCommonStyles, handleBorderRadius } from "../commonNodeMethods";
import handleImage from "../handleImages";

class GFFrame extends GFBaseNode {
    public html: string;
    public css: string;
    public images: GFImage[] = [];

    constructor(node: FrameNode) {
        super(node);
        this.html = "";
        this.css = "";
        this.images = [];
    }

    async init() {
        const { html, css, images } = await getNodes((this.node as FrameNode).children);
        this.html = html;
        this.css = css;
        this.images = this.images.concat(images);
    }

    async createHTML(): Promise<string> {
        console.log('Frame HTML:', this.html);
        return `<div class="${this.className}">
            ${this.html}
        </div>`;
    }

    async createCSS(): Promise<string> {
                let imageBackground = '';

        if (hasImage((this.node as FrameNode).fills)) {
            this.setAllChildrenVisibility(false);
            const imageData = await handleImage(this.node as FrameNode);
            imageBackground = `background: url('./${imageData.name}') no-repeat center center / cover;`;
            this.images.push({ name: imageData.name, data: imageData.buffer });
            this.setAllChildrenVisibility(true);
        }

        return `
        .${this.className} {
            ${generateCommonStyles(this.node as FrameNode)}
            ${handleBorderRadius(this.node as FrameNode)}
            ${generateAdditionalStyles(this.node as FrameNode)}
            ${imageBackground}
        }

        ${this.css}
        `
    }

    setAllChildrenVisibility(visible: boolean) {
        (this.node as FrameNode).children.forEach(child => {
            child.visible = visible;
        });
    }
}

export default GFFrame;
