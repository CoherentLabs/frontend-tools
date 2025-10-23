import { NodesWithFillsAndStrokes, PrimitiveNodes } from '../types/commonTypes';
import { additionalBackgroundStyles, generateBackground } from './utils/background';
import { generateBorderRadius, generateBorders } from './utils/border';
import { generateOpacity } from './utils/opacity';
import { generatePosition } from './utils/position';
import { generateSize } from './utils/size';
import { generateZIndex } from './utils/zIndex';

class CSSExporter {
    public node: SceneNode;

    constructor(node: SceneNode) {
        this.node = node;
    }

    generateElementStyle() {
        const { width, height } = generateSize(this.node);
        const { top, left } = generatePosition(this.node as PrimitiveNodes);
        const opacity = generateOpacity((this.node as PrimitiveNodes).opacity);
        const zIndex = generateZIndex(this.node as PrimitiveNodes);

        return `
            width: ${width};
            height: ${height};
            position: absolute;
            top: ${top};
            left: ${left};
            opacity: ${opacity};
            z-index: ${zIndex};
        `;
    }

    generateBackgroundElementStyle() {
        const { topLeftRadius, bottomLeftRadius, bottomRightRadius, topRightRadius } = generateBorderRadius(
            this.node as PrimitiveNodes
        );
        const background = generateBackground(this.node as NodesWithFillsAndStrokes);
        const zIndex = generateZIndex(this.node as PrimitiveNodes);

        return `
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            overflow: hidden;
            border-top-left-radius: ${topLeftRadius};
            border-top-right-radius: ${topRightRadius};
            border-bottom-right-radius: ${bottomRightRadius};
            border-bottom-left-radius: ${bottomLeftRadius};
            ${background ? `background: ${background}` : ''};
            z-index: ${zIndex};
        `;
    }

    generateBeforePseudo(): string {
        const pseudoStyles = additionalBackgroundStyles(this.node as NodesWithFillsAndStrokes);
        if (!pseudoStyles) {
            return '';
        }

        return `
            content: '';
            position: absolute;
            transform-origin: top left;
            ${pseudoStyles}
        `;
    }

    generateAfterPseudo(): string {
        const pseudoStyles = generateBorders(this.node as NodesWithFillsAndStrokes);
        if (!pseudoStyles) {
            return '';
        }

        const zIndex = generateZIndex(this.node as PrimitiveNodes) + 2;

        return `
            content: '';
            position: absolute;
            z-index: ${zIndex};
            ${pseudoStyles}
        `;
    }
}

export default CSSExporter;
