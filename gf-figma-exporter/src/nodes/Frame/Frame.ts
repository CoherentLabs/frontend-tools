import { getNodes } from "../../exporter";
import { generateAdditionalStyles, generateClassName, generateCommonStyles, handleBorderRadius } from "../commonNodeMethods";

class GFFrame {
    public node: FrameNode;
    public className: string;
    public html: string;
    public css: string;

    constructor(node: FrameNode) {
        this.node = node;
        this.className = generateClassName(this.node.name, this.node.id);
        ({ html: this.html, css: this.css } = getNodes(this.node.children));
    }

    createHTML(): string {
        return `<div class="${this.className}">
            ${this.html}
        </div>`;
    }

    createCSS(): string {
        return `
        .${this.className} {
            ${generateCommonStyles(this.node)}
            ${handleBorderRadius(this.node)}
            ${generateAdditionalStyles(this.node)}
        }

        ${this.css}
        `
    }
}

export default GFFrame;
