import { NodesWithFillsAndStrokes, PrimitiveNodes } from '../../types/commonTypes';
import { convertPXtoVH } from '../../utils/convertUnits';
import createRGBAColor from '../../utils/createRGBAColor';
import generateImageName from '../../utils/generateImageName';
import getPathBBox from '../../utils/getPathBBox';
import { linearGradientHandle } from '../../utils/gradientUtils';
import isNodeSVG from '../../utils/isNodeSVG';
import isBasicStroke from '../../utils/isStrokeBasic';

export function generateBorderRadius(node: PrimitiveNodes): {
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
    const { topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius } = node as RectangleNode | FrameNode;

    return {
        topLeftRadius: `${convertPXtoVH(topLeftRadius)}vh`,
        bottomLeftRadius: `${convertPXtoVH(bottomLeftRadius)}vh`,
        bottomRightRadius: `${convertPXtoVH(bottomRightRadius)}vh`,
        topRightRadius: `${convertPXtoVH(topRightRadius)}vh`,
    };
}

export async function generateBorders(node: NodesWithFillsAndStrokes): Promise<string> {
    const { strokes } = node;

    let result = '';

    if (!strokes || strokes.length === 0) return '';

    if (strokes.every((stroke) => stroke.visible === false)) return '';

    const bbox = isNodeSVG(node) && node.strokeGeometry[0] ? await getPathBBox(node.strokeGeometry[0].data) : undefined;

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

function calculateElementWidthWithBorder(node: NodesWithFillsAndStrokes, bbox?: DOMRect): string {
    let result = '';
    
    const width = convertPXtoVH(bbox ? bbox.width : node.width);
    const height = convertPXtoVH(bbox ? bbox.height : node.height);
    if (node.strokeWeight === figma.mixed && node.type !== 'ELLIPSE') {
        const left = convertPXtoVH(node.strokeLeftWeight);
        const right = convertPXtoVH(node.strokeRightWeight);
        result = `width: ${(width + calculateOffsetBorder(node, left) + calculateOffsetBorder(node, right)).toFixed(
            2
        )}vh;\n`;

        const top = convertPXtoVH(node.strokeTopWeight);
        const bottom = convertPXtoVH(node.strokeBottomWeight);
        result += `height: ${(height + calculateOffsetBorder(node, top) + calculateOffsetBorder(node, bottom)).toFixed(
            2
        )}vh;\n`;
        return result;
    }

    const strokeWidth = convertPXtoVH(node.strokeWeight as number);

    result += `width: ${(width + calculateOffsetBorder(node, strokeWidth)).toFixed(2)}vh;\n`;
    result += `height: ${(height + calculateOffsetBorder(node, strokeWidth)).toFixed(2)}vh;\n`;
    return result;
}

function calculateOffsetBorder(node: NodesWithFillsAndStrokes, strokeWidth: number): number {
    switch (node.strokeAlign) {
        case 'INSIDE': {
            return 0;
        }
        case 'OUTSIDE': {
            return strokeWidth * 2;
        }
        case 'CENTER': {
            return strokeWidth;
        }
    }
}

function calculatePositionWithBorder(node: NodesWithFillsAndStrokes, bbox?: DOMRect): string {
    let leftOffset = 0;
    let topOffset = 0;
    if (node.strokeWeight === figma.mixed && node.type !== 'ELLIPSE') {
        leftOffset = node.strokeLeftWeight;
        topOffset = node.strokeTopWeight;
    } else {
        leftOffset = node.strokeWeight as number;
        topOffset = node.strokeWeight as number;
    }

    if (bbox) {
        leftOffset += bbox.x;
        topOffset += bbox.y;
    }

    switch (node.strokeAlign) {
        case 'INSIDE': {
            return `top: ${convertPXtoVH(bbox ? bbox.y : 0).toFixed(2)}vh;\nleft: ${convertPXtoVH(
                bbox ? bbox.x : 0
            ).toFixed(2)}vh;\n`;
        }
        case 'OUTSIDE': {
            return `top: -${convertPXtoVH(topOffset).toFixed(2)}vh;\nleft: -${convertPXtoVH(leftOffset).toFixed(
                2
            )}vh;\n`;
        }
        case 'CENTER': {
            return `top: -${convertPXtoVH(topOffset / 2).toFixed(2)}vh;\nleft: -${convertPXtoVH(leftOffset / 2).toFixed(
                2
            )}vh;\n`;
        }
    }
}
