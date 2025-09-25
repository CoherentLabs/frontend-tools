import { convertPTtoVH, convertPXtoVH, getPercentage } from '../utils/convertUnits';
import createRGBAColor from '../utils/createRGBAColor';
import getParentSize from '../utils/parentSize';
import sanitizeNames from '../utils/sanitizeNames';

function generateSize(width: number, height: number): string {
    return `width: ${convertPXtoVH(width)}vh;
        height: ${convertPXtoVH(height)}vh;`;
}

function generatePosition(node: SceneNode): string {
    const { x, y, parent } = node;
    const { width, height } = getParentSize(parent);

    if (width === 0 && height === 0) {
        return '';
    }

    return `position: absolute;
        left: ${getPercentage(x, width)}%;
        top: ${getPercentage(y, height)}%;`;
}

function generateBackground(fills: readonly Paint[]): string {
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

                const { gradientStops } = fill;
                if (gradientStops && gradientStops.length > 0) {
                    const gradientColors = gradientStops.map((stop) => {
                        const { color, position } = stop;
                        const { r, g, b, a } = color;
                        return `${createRGBAColor(r, g, b, a)} ${position * 100}%`;
                    });
                    backgroundArrays.push(`linear-gradient(${gradientColors.join(', ')})`);
                }
                break;
            }

            default:
                break;
        }
    }
    return `background: ${backgroundArrays.join(', ')};`;
}

function generateOpacity(opacity: number | undefined): string {
    if (opacity === undefined || opacity === 1) {
        return '';
    }
    return `opacity: ${opacity};`;
}

function generateCommonStyles(node: SceneNode): string {
    const { width, height, opacity } = node;
    return `
        ${generateSize(width, height)}
        ${generatePosition(node)}
        ${generateOpacity(opacity)}
    `;
}

function generateAdditionalStyles(node: SceneNode): string {
    const { fills } = node;

    return `
        ${generateBackground(fills)}
        ${handleBorders(node)}
    `;
}

function handleBorderRadius(node: SceneNode): string {
    const { topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius } = node;
    return `border-top-left-radius: ${convertPXtoVH(topLeftRadius)}vh;
        border-top-right-radius: ${convertPXtoVH(topRightRadius)}vh;
        border-bottom-right-radius: ${convertPXtoVH(bottomRightRadius)}vh;
        border-bottom-left-radius: ${convertPXtoVH(bottomLeftRadius)}vh;`;
}

function handleBorders(node: SceneNode): string {
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

    const color = strokes[0].color;
    const borderColor = createRGBAColor(color.r, color.g, color.b, strokes[0].opacity);

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
export { generateCommonStyles, generateAdditionalStyles, handleBorderRadius, generateClassName };
