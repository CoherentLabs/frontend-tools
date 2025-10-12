import { SceneNodeWithFills } from '../types/commonTypes';
import { convertPXtoVH, getPercentage } from '../utils/convertUnits';
import createRGBAColor from '../utils/createRGBAColor';
import {
    angularGradientHandle,
    diamondGradientHandle,
    linearGradientHandle,
    radialGradientHandle,
} from '../utils/gradientUtils';
import hasImage from '../utils/hasImage';
import getParentSize from '../utils/parentSize';
import sanitizeNames from '../utils/sanitizeNames';

type CommonNode = FrameNode | RectangleNode | EllipseNode ;

function generateSize(width: number, height: number): string {
    return `width: ${convertPXtoVH(width)}vh;
        height: ${convertPXtoVH(height)}vh;`;
}

function generatePosition(node: CommonNode): string {
    const { x, y, parent } = node;
    const { width, height } = getParentSize(parent);

    if (width === 0 && height === 0) {
        return '';
    }

    return `position: absolute;
        left: ${getPercentage(x, width)}%;
        top: ${getPercentage(y, height)}%;`;
}

function generateBackground(node: SceneNode): string {
    const { fills } = node;

    if (!fills || fills.length === 0) {
        return '';
    }

    const backgroundArrays = [];

    for (const fill of fills) {
        switch (fill.type) {
            case 'SOLID': {
                if (!fill.visible) break;

                const { r, g, b } = fill.color;
                const a = fill.opacity !== undefined ? fill.opacity : 1;
                backgroundArrays.push(createRGBAColor(r, g, b, a));
                break;
            }

            case 'GRADIENT_LINEAR': {
                if (!fill.visible) break;

                const { gradient } = linearGradientHandle(fill, node.width, node.height, node.x, node.y);
                backgroundArrays.unshift(gradient);
                break;
            }

            case 'GRADIENT_RADIAL': {
                if (!fill.visible || node.type === 'FRAME') break;
                const { r, g, b, a } = fill.gradientStops[fill.gradientStops.length - 1].color;
                const lastColor = createRGBAColor(r, g, b, a);
                backgroundArrays.push(lastColor);
                break;
            }

            case 'GRADIENT_ANGULAR': {
                if (!fill.visible) break;

                const { gradient } = angularGradientHandle(fill, node.width, node.height);
                backgroundArrays.unshift(gradient);
                break;
            }

            case 'GRADIENT_DIAMOND': {
                if (!fill.visible || node.type === 'FRAME') break;
                const { r, g, b, a } = fill.gradientStops[fill.gradientStops.length - 1].color;
                const lastColor = createRGBAColor(r, g, b, a);
                backgroundArrays.push(lastColor);
                break;
            }
        }
    }

    if (backgroundArrays.length === 0) return '';

    return `background: ${backgroundArrays.join(', ')};`;
}

function generateOpacity(opacity: number | undefined): string {
    if (opacity === undefined || opacity === 1) {
        return '';
    }
    return `opacity: ${opacity};`;
}

function generateCommonStyles(node: CommonNode): string {
    const { width, height, opacity } = node;
    return `
        ${generateSize(width, height)}
        ${generatePosition(node)}
        ${generateOpacity(opacity)}
        overflow: hidden;
    `;
}

function generateAdditionalStyles(node: CommonNode): string {

    return `
        ${!hasImage(node.fills) ? generateBackground(node) : ''}
        ${handleBorders(node)}
    `;
}

function addPseudoStylesForBackground(node: CommonNode): string {
    let result = '';
    if (!node.fills) return result;

    const specialFillTypes = ['GRADIENT_RADIAL', 'GRADIENT_DIAMOND'];

    const specialFills = node.fills.filter((fill) => specialFillTypes.includes(fill.type) && fill.visible);
    if (!specialFills || specialFills.length === 0) {
        return result;
    }

    for (const fill of specialFills) {
        switch (fill.type) {
            case 'GRADIENT_RADIAL': {
                const { gradient, rotation, size, position } = radialGradientHandle(fill, node.height, node.width);
                result += buildPseudoElementForSpecialFill(gradient, rotation, size, position);
                break;
            }

            case 'GRADIENT_DIAMOND': {
                const { gradient, size, position, rotation } = diamondGradientHandle(fill, node.width, node.height);
                result += buildPseudoElementForSpecialFill(gradient, rotation, size, position);
                break;
            }
        }
    }

    return result;
}

function buildPseudoElementForSpecialFill(gradient: string, rotation: string, size: string, position: string): string {
    return `
        content: '';
        position: absolute;
        background: ${gradient};
        transform: rotate(${rotation}deg) translate(-50%, -50%);
        transform-origin: top left;
        ${size}
        ${position}
    `;
}

function generatePseudoStyles(node: SceneNode): string {
    if (addPseudoStylesForBackground(node) === '') return '';

    return `::before {
    ${addPseudoStylesForBackground(node)}
    }`;
}

function handleBorderRadius(node: SceneNode): string {
    if (node.type !== 'RECTANGLE' && node.type !== 'FRAME') {
        return '';
    }
    const { topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius } = node;
    return `border-top-left-radius: ${convertPXtoVH(topLeftRadius)}vh;
        border-top-right-radius: ${convertPXtoVH(topRightRadius)}vh;
        border-bottom-right-radius: ${convertPXtoVH(bottomRightRadius)}vh;
        border-bottom-left-radius: ${convertPXtoVH(bottomLeftRadius)}vh;`;
}

function handleBorders(node: CommonNode): string {
    const {
        strokes,
        strokeWeight,
        strokeTopWeight,
        strokeBottomWeight,
        strokeLeftWeight,
        strokeRightWeight,
        strokeAlign,
    } = node;

    if (!strokes || strokes.length === 0) {
        return '';
    }

    let borderColor = '';
    const stroke = strokes[0];
    if (stroke.type === 'SOLID' && stroke.color) {
        borderColor = createRGBAColor(stroke.color.r, stroke.color.g, stroke.color.b, stroke.opacity || 1);
    } else {
        // fallback to transparent if not a solid stroke
        borderColor = 'rgba(0,0,0,0)';
    }

    if (strokeAlign === 'INSIDE') {
        if (typeof strokeWeight === 'number') {
            return `box-shadow: inset 0 0 0 ${convertPXtoVH(strokeWeight)}vh ${borderColor};`;
        }

        return `box-shadow: inset 0 ${convertPXtoVH(strokeTopWeight)}vh 0 0 ${borderColor},
            inset 0 -${convertPXtoVH(strokeBottomWeight)}vh 0 0 ${borderColor},
            inset -${convertPXtoVH(strokeRightWeight)}vh 0 0 0 ${borderColor},
            inset ${convertPXtoVH(strokeLeftWeight)}vh 0 0 0 ${borderColor};`;
    }

    if (strokeAlign === 'OUTSIDE') {
        if (typeof strokeWeight === 'number') {
            return `box-shadow: 0 0 0 ${convertPXtoVH(strokeWeight)}vh ${borderColor};`;
        }
        return `box-shadow: 0 ${convertPXtoVH(strokeTopWeight)}vh 0 0 ${borderColor},
         0 -${convertPXtoVH(strokeBottomWeight)}vh 0 0 ${borderColor},
         -${convertPXtoVH(strokeRightWeight)}vh 0 0 0 ${borderColor},
         ${convertPXtoVH(strokeLeftWeight)}vh 0 0 0 ${borderColor};`;
    }

    if (typeof strokeWeight === 'number') {
        return `border: ${convertPXtoVH(strokeWeight)}vh solid ${borderColor};`;
    }

    return `border-top: ${convertPXtoVH(strokeTopWeight)}vh solid ${borderColor};
        border-right: ${convertPXtoVH(strokeRightWeight)}vh solid ${borderColor};
        border-bottom: ${convertPXtoVH(strokeBottomWeight)}vh solid ${borderColor};
        border-left: ${convertPXtoVH(strokeLeftWeight)}vh solid ${borderColor};`;
}

function generateClassName(name: string, id: string): string {
    return `${sanitizeNames(name)}-${sanitizeNames(id)}`;
}

export { generateCommonStyles, generateAdditionalStyles, handleBorderRadius, generateClassName, generatePseudoStyles };
