import { NodesWithFillsAndStrokes, PrimitiveNodes } from '../types/commonTypes';
import isNodeSVG from '../utils/isNodeSVG';
import StyleManager from './StyleManager/StyleManager';
import { additionalBackgroundStyles, generateBackground, generateBackgroundRect } from './utils/background';
import { generateBorderRadius, generateBorders } from './utils/border';
import { generateOpacity } from './utils/opacity';
import { generatePosition } from './utils/position';
import { generateSize } from './utils/size';
import { generateZIndex } from './utils/zIndex';

class CSSExporter {
    public node: SceneNode;
    public style: StyleManager;
    public backgroundStyles: StyleManager;
    public pseudoBeforeStyles: StyleManager;
    public borderStyles: StyleManager;

    constructor(node: SceneNode) {
        this.node = node;
        this.style = new StyleManager();
        this.backgroundStyles = new StyleManager();
        this.borderStyles = new StyleManager();
        this.pseudoBeforeStyles = new StyleManager();
    }

    generateElementStyle() {
        const { width, height } = generateSize(this.node);
        const { top, left } = generatePosition(this.node as PrimitiveNodes);
        const opacity = generateOpacity((this.node as PrimitiveNodes).opacity);
        const zIndex = generateZIndex(this.node as PrimitiveNodes);

        this.style.add('width', width);
        this.style.add('height', height);
        this.style.add('position', 'absolute');
        this.style.add('top', top);
        this.style.add('left', left);
        this.style.add('opacity', opacity);
        this.style.add('z-index', zIndex.toString());

        return this.style.getCSS();
    }

    async generateBackgroundElementStyle() {
        const { topLeftRadius, bottomLeftRadius, bottomRightRadius, topRightRadius } = generateBorderRadius(
            this.node as PrimitiveNodes
        );
        const background = generateBackground(this.node as NodesWithFillsAndStrokes);
        const zIndex = generateZIndex(this.node as PrimitiveNodes);

        const {x, y, width, height} = await generateBackgroundRect(this.node as NodesWithFillsAndStrokes);

        this.backgroundStyles.add('width', `${width}%`);
        this.backgroundStyles.add('height', `${height}%`);
        this.backgroundStyles.add('position', 'absolute');
        this.backgroundStyles.add('top', `${y}%`);
        this.backgroundStyles.add('left', `${x}%`);
        this.backgroundStyles.add('overflow', 'hidden');
        this.backgroundStyles.add('border-top-left-radius', !isNodeSVG(this.node) ? topLeftRadius : '0');
        this.backgroundStyles.add('border-top-right-radius', !isNodeSVG(this.node) ? topRightRadius : '0');
        this.backgroundStyles.add('border-bottom-right-radius', !isNodeSVG(this.node) ? bottomRightRadius : '0');
        this.backgroundStyles.add('border-bottom-left-radius', !isNodeSVG(this.node) ? bottomLeftRadius : '0');
        this.backgroundStyles.add('z-index', zIndex.toString());
        if (background) {
            this.backgroundStyles.add('background', background);
        }

        return this.backgroundStyles.getCSS();
    }

    generateBeforePseudo(): string {
        const pseudoStyles = additionalBackgroundStyles(this.node as NodesWithFillsAndStrokes);
        if (!pseudoStyles) {
            return '';
        }

        this.pseudoBeforeStyles.add('content', "''");
        this.pseudoBeforeStyles.add('position', 'absolute');
        this.pseudoBeforeStyles.add('transform-origin', 'top left');

        return `
            ${this.pseudoBeforeStyles.getCSS()}
            ${pseudoStyles}
        `;
    }

    async generateAfterPseudo(): Promise<string> {
        const pseudoStyles = await generateBorders(this.node as NodesWithFillsAndStrokes);
        if (!pseudoStyles) {
            return '';
        }

        const zIndex = generateZIndex(this.node as PrimitiveNodes) + 2;

        this.borderStyles.add('content', "''");
        this.borderStyles.add('position', 'absolute');
        this.borderStyles.add('z-index', zIndex.toString());

        return `
            ${this.borderStyles.getCSS()}
            ${pseudoStyles}
        `;
    }
}

export default CSSExporter;
