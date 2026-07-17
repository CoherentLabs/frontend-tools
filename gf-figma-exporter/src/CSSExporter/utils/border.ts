import { NodesWithFillsAndStrokes, PrimitiveNodes, SVGNodes } from '../../types/commonTypes';
import { convertPXtoVH } from '../../utils/convertUnits';
import createRGBAColor from '../../utils/createRGBAColor';
import generateImageName from '../../utils/generateImageName';
import getPathBBox from '../../utils/getPathBBox';
import { linearGradientHandle } from '../../utils/gradientUtils';
import isNodeSVG from '../../utils/isNodeSVG';
import isBasicStroke from '../../utils/isStrokeBasic';

export function generateBorderRadius(node: PrimitiveNodes | TextNode): {
    topLeftRadius: string;
    bottomLeftRadius: string;
    bottomRightRadius: string;
    topRightRadius: string;
} {
    if (node.type === 'GROUP') {
        return { topLeftRadius: '0vh', bottomLeftRadius: '0vh', bottomRightRadius: '0vh', topRightRadius: '0vh' };
    }

    if (node.type === 'ELLIPSE' && node.cornerRadius !== figma.mixed) {
        return { topLeftRadius: `50%`, bottomLeftRadius: `50%`, bottomRightRadius: `50%`, topRightRadius: `50%` };
    }

    if (node.type === 'TEXT') {
        return { topLeftRadius: '0vh', bottomLeftRadius: '0vh', bottomRightRadius: '0vh', topRightRadius: '0vh' };
    }

    const { topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius } = node as RectangleNode | FrameNode;

    return {
        topLeftRadius: `${convertPXtoVH(topLeftRadius).toFixed(2)}vh`,
        bottomLeftRadius: `${convertPXtoVH(bottomLeftRadius).toFixed(2)}vh`,
        bottomRightRadius: `${convertPXtoVH(bottomRightRadius).toFixed(2)}vh`,
        topRightRadius: `${convertPXtoVH(topRightRadius).toFixed(2)}vh`,
    };
}

export async function generateBorders(node: NodesWithFillsAndStrokes): Promise<string> {
    const { strokes } = node;

    let result = '';

    if (!strokes || strokes.length === 0) return '';

    if (strokes.every((stroke) => stroke.visible === false)) return '';

    const bbox = node.strokeGeometry[0] ? await getPathBBox(node.strokeGeometry[0].data) : undefined;

    result += calculateElementWidthWithBorder(node, bbox);
    result += calculatePositionWithBorder(node, bbox);

    const handleImageStroke = () => {
        result += `background-image: url(./${generateImageName(node.name, node.id, 'border')});\n`;
        result += `background-repeat: no-repeat;\n`;
        result += `background-size: 100% 100%;\n`;
        result += `background-position: center;\n`;
        return result;
    };

    if (strokes.length > 1) {
        // There are no multiple border support in CSS, so we export as image
        handleImageStroke();
    }

    if (node.cornerRadius === figma.mixed || node.cornerRadius > 0) {
        // In CSS border-images do not support rounded corners well, so we export as image
        handleImageStroke();
    }

    if (node.dashPattern.length > 0) {
        // Gameface currently does not support dashed borders, so we export as image
        handleImageStroke();
    }

    if (node.type === 'ELLIPSE') {
        // Ellipses are rectangles with 50% border radius in CSS, which border images do not support well, so we export as image
        handleImageStroke();
    }

    if (isNodeSVG(node)) {
        // SVG nodes have complex stroke geometry that CSS borders do not support, so we export as image
        handleImageStroke();
        return result;
    }

    switch (strokes[0].type) {
        case 'SOLID': {
            if (!isBasicStroke(node)) {
                // Complex stroke geometry is not supported in CSS borders, so we export as image
                handleImageStroke();
            }

            const { r, g, b } = (strokes[0] as SolidPaint).color;
            const a = strokes[0].opacity !== undefined ? strokes[0].opacity : 1;
            result += `border-color: ${createRGBAColor(r, g, b, a)};\n`;
            result += handleBorderWidths(node);
            result += `border-style: solid;\n`;

            return result;
        }

        case 'GRADIENT_LINEAR': {
            if (!isBasicStroke(node)) {
                // Complex stroke geometry is not supported in CSS borders, so we export as image
                handleImageStroke();
                return result;
            }

            const { gradient } = linearGradientHandle(
                strokes[0] as GradientPaint,
                node.width,
                node.height,
                node.x,
                node.y
            );
            result += `border-image: ${gradient} 1;\n`;
            result += handleBorderWidths(node);
            result += `border-style: solid;\n`;
            return result;
        }
        default: {
            // Other stroke types are not supported in CSS borders, so we export as image
            handleImageStroke();
            return result;
        }
    }
}

// Helper functions for generateBorders

function handleBorderWidths(node: NodesWithFillsAndStrokes): string {
    let result = '';
    if (node.strokeWeight === figma.mixed && node.type !== 'ELLIPSE') {
        result += `border-left-width: ${convertPXtoVH(node.strokeLeftWeight).toFixed(2)}vh;\n`;
        result += `border-right-width: ${convertPXtoVH(node.strokeRightWeight).toFixed(2)}vh;\n`;
        result += `border-top-width: ${convertPXtoVH(node.strokeTopWeight).toFixed(2)}vh;\n`;
        result += `border-bottom-width: ${convertPXtoVH(node.strokeBottomWeight).toFixed(2)}vh;\n`;
        return result;
    }

    result = `border-width: ${convertPXtoVH(node.strokeWeight as number).toFixed(2)}vh;\n`;
    return result;
}

function calculateElementWidthWithBorder(node: NodesWithFillsAndStrokes | SVGNodes, bbox?: DOMRect): string {
    let result = '';
    const {width, height} = node.type === 'VECTOR' ? bbox! : calculateOffsetBorderSize(node, bbox);

    result += `width: ${convertPXtoVH(width).toFixed(2)}vh;\n`;
    result += `height: ${convertPXtoVH(height).toFixed(2)}vh;\n`;
    return result;
}

function calculateOffsetBorderSize(
    node: NodesWithFillsAndStrokes | SVGNodes,
    bbox?: DOMRect
): { width: number; height: number } {
    const width = bbox ? bbox.width : node.width;
    const height = bbox ? bbox.height : node.height;

    if ((bbox && bbox.width < node.width && bbox.height < node.height)) {
        return { width, height };
    }

    switch (node.strokeAlign) {
        case 'OUTSIDE':
            return { width, height };

        case 'CENTER':
            return {
                width: width - (width - node.width) / 2,
                height: height - (height - node.height) / 2,
            };

        case 'INSIDE':
            return {
                width: width - (width - node.width),
                height: height - (height - node.height),
            };
    }
}

function calculatePositionWithBorder(node: NodesWithFillsAndStrokes, bbox?: DOMRect): string {
    let result = '';
    const { x, y } = calculateOffsetBorderPosition(node, bbox);

    result += `left: ${convertPXtoVH(x).toFixed(2)}vh;\n`;
    result += `top: ${convertPXtoVH(y).toFixed(2)}vh;\n`;

    return result;

}

function calculateOffsetBorderPosition(
    node: NodesWithFillsAndStrokes | SVGNodes,
    bbox?: DOMRect
): { x: number; y: number } {
    const x = bbox ? bbox.x : node.x;
    const y = bbox ? bbox.y : node.y;

    if ((bbox && bbox.x > 0 && bbox.y > 0)) {
        return { x, y };
    }

    switch (node.strokeAlign) {
        case 'OUTSIDE':
            return { x, y };

        case 'CENTER':
            return { x: x / 2, y: y / 2 };

        case 'INSIDE':
            return { x: 0, y: 0 };
    }
}
