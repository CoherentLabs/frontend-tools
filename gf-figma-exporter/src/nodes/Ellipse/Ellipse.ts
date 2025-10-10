import { generateAdditionalStyles, generateClassName, generateCommonStyles } from '../commonNodeMethods';

class GFEllipse {
    public node: EllipseNode;
    public className: string;

    constructor(node: EllipseNode) {
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
            border-radius: 50%;
        }`;
    }
}

export default GFEllipse;