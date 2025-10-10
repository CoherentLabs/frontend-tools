import { generateAdditionalStyles, generateClassName, generateCommonStyles, generatePseudoStyles } from '../commonNodeMethods';

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
          let pseudoElement = '';
        

        if (generatePseudoStyles(this.node) !== '') {
            pseudoElement = `.${this.className}${generatePseudoStyles(this.node)}`;
        }


        return `
        .${this.className} {
           ${generateCommonStyles(this.node)}
           ${generateAdditionalStyles(this.node)}
            border-radius: 50%;
        }
            
         ${pseudoElement}
        `;

       
    }
}

export default GFEllipse;