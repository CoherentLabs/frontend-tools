import { generateAdditionalStyles, generateClassName, generateCommonStyles, handleBorderRadius } from "../commonNodeMethods";

class GFRectangle {
    public node: RectangleNode;
    public className: string;

    constructor(node: RectangleNode) {
        this.node = node;
        this.className = generateClassName(this.node.name, this.node.id);
    }

    createHTML(): string {
        return `<div class="${this.className}"></div>`;
    }

    createCSS(): string {
        return `
        .${this.className} {
            ${generateCommonStyles(this.node)}
            ${generateAdditionalStyles(this.node)}
            ${handleBorderRadius(this.node)}
        }`
    }
}

export default GFRectangle;