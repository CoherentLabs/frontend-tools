import { isItalicStyle } from '../FontExporter/utils/parseStyleUtils';
import {
    AvailableNode,
    ExportableNodes,
    NodesWithFillsAndStrokes,
    PrimitiveNodes,
    SVGNodes,
    TextSegment,
} from '../types/commonTypes';
import isFlexItem from '../utils/isFlexItem';
import isNodeSVG from '../utils/isNodeSVG';
import StyleManager from './StyleManager/StyleManager';
import { additionalBackgroundStyles, generateBackground, generateBackgroundRect } from './utils/background';
import { generateBlendMode } from './utils/blendMode';
import { generateBorderRadius, generateBorders } from './utils/border';
import { generateEffectStyles } from './utils/effects';
import {
    calculateCounterAxisGap,
    calculateGap,
    clampNegativeGap,
    generateFlexContainerStyles,
    generateFlexItemStyles,
    getMinChildSizeVh,
    isFirstFlexChild,
    isNegativeGap,
} from './utils/flex';
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
import { generatePaddings } from './utils/padding';
import { generatePosition } from './utils/position';
import { generateFlexSize, generateSize } from './utils/size';
import { generateTransformStyle } from './utils/transforms';
import { generateZIndex } from './utils/zIndex';

class CSSExporter {
    public node: ExportableNodes;
    public style: StyleManager;
    public backgroundStyles: StyleManager;
    public pseudoBeforeStyles: StyleManager;
    public borderStyles: StyleManager;
    public textStyles: StyleManager;
    public flexContainerStyles: StyleManager;

    constructor(node: ExportableNodes) {
        this.node = node;
        this.style = new StyleManager();
        this.backgroundStyles = new StyleManager();
        this.borderStyles = new StyleManager();
        this.pseudoBeforeStyles = new StyleManager();
        this.textStyles = new StyleManager();
        this.flexContainerStyles = new StyleManager();
    }

    async generateElementStyle(isComponentRoot: boolean = false) {
        const { width, height } = generateSize(this.node as AvailableNode);
        const { top, left } = await generatePosition(this.node as PrimitiveNodes);
        const opacity = generateOpacity((this.node as PrimitiveNodes).opacity);
        const zIndex = generateZIndex(this.node as PrimitiveNodes);
        const { filter, backDropFilter } = generateEffectStyles(this.node as SVGNodes | NodesWithFillsAndStrokes);
        const blendMode = generateBlendMode(this.node as AvailableNode);
        if (blendMode !== 'normal') {
            this.style.add('mix-blend-mode', blendMode);
        }

        const { topLeftRadius, bottomLeftRadius, bottomRightRadius, topRightRadius } = generateBorderRadius(
            this.node as PrimitiveNodes
        );

        const transform = generateTransformStyle(this.node as PrimitiveNodes);

        this.style.add('font-size', '1vh');
        this.style.add('width',`${width}vh`);
        this.style.add('height', `${height}vh`);
        this.style.add('position', isComponentRoot ? 'relative' : 'absolute');
        if (!isComponentRoot) {
            this.style.add('top', top);
            this.style.add('left', left);
        }
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

        if (transform && !this.node.isMask && !isComponentRoot) {
            this.style.add('transform', transform);
            // Flex items lose their top/left (setFlexElementStyle strips them so flexbox controls
            // position instead) — top/left is exactly what a top-left pivot relies on to cancel a
            // flip's shift-by-own-dimension effect, so a flex item's flip would render shifted outside
            // its flexbox-assigned box. Pivoting at center avoids needing that compensation at all,
            // since a centered flip/rotation stays within the box regardless of its position. Non-flex
            // elements keep top-left, matching their already-correct absolute-position compensation.
            this.style.add('transform-origin', isFlexItem(this.node as AvailableNode) ? 'center' : 'top left');
        }

        this.setFlexElementStyle();
        this.setPaddings();

        return this.style.getCSS();
    }

    async setFlexContainerStyle() {
        if (this.node.type !== 'FRAME' && this.node.type !== 'INSTANCE' && this.node.type !== 'COMPONENT') return;

        const { direction, alignContent, alignItems, justifyContent, wrap } = generateFlexContainerStyles(
            this.node as FrameNode
        );

        const { width, height } = await generateFlexSize(this.node as AvailableNode);
        const firstChild = 'children' in this.node && this.node.children.length > 0
            ? this.node.children[0] as AvailableNode
            : undefined;
        const gap = firstChild ? calculateGap(firstChild) : '0';

        this.flexContainerStyles.add('width', width);
        this.flexContainerStyles.add('height', height);
        this.flexContainerStyles.add('display', 'flex');
        this.flexContainerStyles.add('flex-direction', direction);
        this.flexContainerStyles.add('flex-wrap', wrap);
        this.flexContainerStyles.add('justify-content', justifyContent);
        this.flexContainerStyles.add('align-items', alignItems);
        this.flexContainerStyles.add('align-content', alignContent);

        // Negative gaps can't use native CSS gap (Gameface doesn't support it) — those are instead
        // simulated per-item in setFlexElementStyle (clamped to each item's own size, matching how
        // Figma itself clamps an overlap), so the container itself needs nothing extra for them.
        if (gap !== '0' && !isNegativeGap(gap)) {
            this.flexContainerStyles.add('gap', gap);
        }

        return this.flexContainerStyles.getCSS();
    }

    private setFlexElementStyle() {
        if (!isFlexItem(this.node as AvailableNode)) return;

        const node = this.node as AvailableNode;
        const { alignSelf, flex } = generateFlexItemStyles(node);
        const gap = calculateGap(node);
        const counterAxisGap = calculateCounterAxisGap(node);
        const parent = node.parent as FrameNode | ComponentNode | InstanceNode;
        const { wrap, direction } = generateFlexContainerStyles(parent);

        this.style.add('position', 'relative'); // Flex items should not have absolute positioning
        this.style.add('flex', flex);
        this.style.add('align-self', alignSelf);
        this.style.remove('top');
        this.style.remove('left');

        // The first child has no previous item to overlap, so it keeps its natural position — only
        // items after it get a margin, clamped to the smallest child in the whole container (mirroring
        // Figma's own clamp on an extreme negative gap: everything overlaps onto the smallest sibling,
        // never further).
        if (isFirstFlexChild(node)) return;

        if (gap !== '0' && isNegativeGap(gap)) {
            const minMainAxisSizeVh = getMinChildSizeVh(parent, direction === 'column' ? 'height' : 'width');
            const clampedGap = clampNegativeGap(gap, minMainAxisSizeVh);

            if (direction === 'column') {
                this.style.add('margin-top', clampedGap);
            } else {
                this.style.add('margin-left', clampedGap);
            }
        }

        if (wrap !== 'nowrap' && counterAxisGap !== '0' && isNegativeGap(counterAxisGap)) {
            const minCrossAxisSizeVh = getMinChildSizeVh(parent, direction === 'column' ? 'width' : 'height');
            const clampedCounterGap = clampNegativeGap(counterAxisGap, minCrossAxisSizeVh);

            if (direction === 'column') {
                this.style.add('margin-left', clampedCounterGap);
            } else {
                this.style.add('margin-top', clampedCounterGap);
            }
        }
    }

    private setPaddings() {
        if (this.node.type !== 'FRAME' && this.node.type !== 'INSTANCE' && this.node.type !== 'COMPONENT') return;

        const { paddingTop, paddingRight, paddingBottom, paddingLeft } = generatePaddings(this.node as FrameNode);

        this.style.add('padding-top', `${paddingTop.toFixed(2)}vh`);
        this.style.add('padding-right', `${paddingRight.toFixed(2)}vh`);
        this.style.add('padding-bottom', `${paddingBottom.toFixed(2)}vh`);
        this.style.add('padding-left', `${paddingLeft.toFixed(2)}vh`);
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

        this.backgroundStyles.add('width', `${width}vh`);
        this.backgroundStyles.add('height', `${height}vh`);
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
