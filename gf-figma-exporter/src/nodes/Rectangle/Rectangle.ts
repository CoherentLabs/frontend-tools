import hasImage from '../../utils/hasImage';
import GFBaseNode from '../BaseNode';
import {
    generateAdditionalStyles,
    generateCommonStyles,
    generatePseudoStyles,
    handleBorderRadius,
} from '../commonNodeMethods';
import handleImage from '../handleImages';

class GFRectangle extends GFBaseNode {

    constructor(node: RectangleNode) {
        super(node);
    }

    async createCSS(): Promise<string> {
        let pseudoElement = '';
        let imageBackground = '';

        if (generatePseudoStyles(this.node) !== '') {
            pseudoElement = `.${this.className}${generatePseudoStyles(this.node)}`;
        }

        if (hasImage((this.node as RectangleNode).fills)) {
            const imageData = await handleImage(this.node as RectangleNode);
            imageBackground = `background: url('./${imageData.name}') no-repeat center center / cover;`;
            this.images.push({ name: imageData.name, data: imageData.buffer });
        }

        return `
        .${this.className} {
            ${generateCommonStyles(this.node as RectangleNode)}
            ${generateAdditionalStyles(this.node as RectangleNode)}
            ${handleBorderRadius(this.node as RectangleNode)}
            ${imageBackground}
        }

        ${pseudoElement}
    `;
    }
}

export default GFRectangle;
