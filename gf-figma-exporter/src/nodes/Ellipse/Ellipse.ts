import hasImage from '../../utils/hasImage';
import GFBaseNode from '../BaseNode';
import { generateAdditionalStyles, generateCommonStyles, generatePseudoStyles } from '../commonNodeMethods';
import handleImage from '../handleImages';

class GFEllipse extends GFBaseNode {
    constructor(node: EllipseNode) {
        super(node);
    }

    async createCSS(): Promise<string> {
        let pseudoElement = '';
        let imageBackground = '';

        if (generatePseudoStyles(this.node) !== '') {
            pseudoElement = `.${this.className}${generatePseudoStyles(this.node)}`;
        }

        if (hasImage((this.node as EllipseNode).fills)) {
            const imageData = await handleImage(this.node as EllipseNode);
            imageBackground = `background: url('./${imageData.name}') no-repeat center center / cover;`;
            this.images.push({ name: imageData.name, data: imageData.buffer });
        }

        return `
        .${this.className} {
            ${generateCommonStyles(this.node as EllipseNode)}
            ${generateAdditionalStyles(this.node as EllipseNode)}
            ${imageBackground}
            border-radius: 50%;
        }
            
         ${pseudoElement}
        `;
    }
}

export default GFEllipse;
