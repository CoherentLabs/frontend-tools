import { isItalicStyle } from '../FontExporter/utils/parseStyleUtils';
import { ExportableNodes, NodesWithFillsAndStrokes, PrimitiveNodes, SVGNodes, TextSegment } from '../types/commonTypes';
import isNodeSVG from '../utils/isNodeSVG';
import StyleManager from './StyleManager/StyleManager';
import { additionalBackgroundStyles, generateBackground, generateBackgroundRect } from './utils/background';
import { generateBorderRadius, generateBorders } from './utils/border';
import { generateEffectStyles } from './utils/effects';
import {
    getFontName,
    getFontSize,
    getLetterSpacing,
    getLineHeight,
    getTextCase,
    getTextColor,
    getTextDecoration,
} from './utils/fonts';
import { generateOpacity } from './utils/opacity';
import { generatePosition } from './utils/position';
import { generateSize } from './utils/size';
import { generateZIndex } from './utils/zIndex';

class CSSExporter {
    public node: ExportableNodes;
    public style: StyleManager;
    public backgroundStyles: StyleManager;
    public pseudoBeforeStyles: StyleManager;
    public borderStyles: StyleManager;
    public textStyles: StyleManager;

    constructor(node: ExportableNodes) {
        this.node = node;
        this.style = new StyleManager();
        this.backgroundStyles = new StyleManager();
        this.borderStyles = new StyleManager();
        this.pseudoBeforeStyles = new StyleManager();
        this.textStyles = new StyleManager();
    }

    async generateElementStyle() {
        const { width, height } = generateSize(this.node);
        const { top, left } = await generatePosition(this.node as PrimitiveNodes);
        const opacity = generateOpacity((this.node as PrimitiveNodes).opacity);
        const zIndex = generateZIndex(this.node as PrimitiveNodes);
        const { filter, backDropFilter } = generateEffectStyles(this.node as SVGNodes | NodesWithFillsAndStrokes);

        const { topLeftRadius, bottomLeftRadius, bottomRightRadius, topRightRadius } = generateBorderRadius(
            this.node as PrimitiveNodes
        );

        this.style.add('font-size', '1vh');
        this.style.add('width', width);
        this.style.add('height', height);
        this.style.add('position', 'absolute');
        this.style.add('top', top);
        this.style.add('left', left);
        this.style.add('opacity', opacity);
        this.style.add('z-index', zIndex.toString());
        this.style.add('border-top-left-radius', !isNodeSVG(this.node) ? topLeftRadius : '0');
        this.style.add('border-top-right-radius', !isNodeSVG(this.node) ? topRightRadius : '0');
        this.style.add('border-bottom-right-radius', !isNodeSVG(this.node) ? bottomRightRadius : '0');
        this.style.add('border-bottom-left-radius', !isNodeSVG(this.node) ? bottomLeftRadius : '0');
        if (filter) {
            this.style.add('filter', filter);
        }
        if (backDropFilter) {
            this.style.add('backdrop-filter', backDropFilter);
        }

        if ((this.node as NodesWithFillsAndStrokes).strokeAlign === 'INSIDE' && this.node.isMask === false) {
            this.style.add('overflow', 'hidden');
        }

        return this.style.getCSS();
    }

    async generateBackgroundElementStyle() {
        const { topLeftRadius, bottomLeftRadius, bottomRightRadius, topRightRadius } = generateBorderRadius(
            this.node as PrimitiveNodes
        );
        const background = generateBackground(this.node as NodesWithFillsAndStrokes);
        const zIndex = generateZIndex(this.node as PrimitiveNodes);

        const { x, y, width, height } = await generateBackgroundRect(this.node as NodesWithFillsAndStrokes);

        const { boxShadow } = generateEffectStyles(this.node as SVGNodes | NodesWithFillsAndStrokes);
        if (boxShadow) {
            this.backgroundStyles.add('box-shadow', boxShadow);
        }

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

    static async generateTextElementStyle(textSegment: TextSegment): Promise<string> {
        const textStyle = new StyleManager();
        const color = getTextColor(textSegment);
        const fontSize = getFontSize(textSegment);
        const letterSpacing = getLetterSpacing(textSegment);
        const lineHeight = getLineHeight(textSegment);
        const textCase = getTextCase(textSegment);
        const fontNames = getFontName(textSegment);
        const style = isItalicStyle(textSegment.fontName.style) ? 'italic' : 'normal';
        const textDecoration = getTextDecoration(textSegment);

        textStyle.add('color', color);
        textStyle.add('font-size', `${fontSize}vh`);
        textStyle.add('font-weight', `${textSegment.fontWeight}`);
        textStyle.add('letter-spacing', letterSpacing);
        textStyle.add('line-height', lineHeight);
        textStyle.add('text-transform', textCase);
        textStyle.add('font-family', `${fontNames}`);
        textStyle.add('font-style', `${style}`);

        if (textDecoration) {
            textStyle.add('text-decoration', textDecoration.style);
            textStyle.add('text-decoration-color', textDecoration.color);
            textStyle.add('text-decoration-thickness', textDecoration.thickness);
            textStyle.add('text-underline-offset', textDecoration.offset);
        }

        return textStyle.getCSS();
    }
}

export default CSSExporter;
