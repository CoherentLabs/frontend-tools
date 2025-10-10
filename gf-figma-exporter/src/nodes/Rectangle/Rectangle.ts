import {
    generateAdditionalStyles,
    generateClassName,
    generateCommonStyles,
    generatePseudoStyles,
    handleBorderRadius,
} from '../commonNodeMethods';

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
        let pseudoElement = '';
        

        if (generatePseudoStyles(this.node) !== '') {
            pseudoElement = `.${this.className}${generatePseudoStyles(this.node)}`;
        }

        return `
        .${this.className} {
            ${generateCommonStyles(this.node)}
            ${generateAdditionalStyles(this.node)}
            ${handleBorderRadius(this.node)}
        }

        ${pseudoElement}
    `;
    }
}

export default GFRectangle;
