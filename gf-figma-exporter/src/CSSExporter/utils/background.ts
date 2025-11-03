import { NodesWithFillsAndStrokes } from '../../types/commonTypes';
import createRGBAColor from '../../utils/createRGBAColor';
import generateImageName from '../../utils/generateImageName';
import {
    linearGradientHandle,
    angularGradientHandle,
    radialGradientHandle,
    diamondGradientHandle,
} from '../../utils/gradientUtils';
import hasImage from '../../utils/hasImage';
import isNodeSVG from '../../utils/isNodeSVG';
import getPathBBox from '../../utils/getPathBBox';
import { getPercentage } from '../../utils/convertUnits';

export const SPECIAL_FILL_TYPES = ['GRADIENT_RADIAL', 'GRADIENT_DIAMOND'];

export function generateBackground(node: NodesWithFillsAndStrokes): string {
    const { fills } = node;

    if (!fills || fills === figma.mixed || fills.length === 0) {
        return '';
    }

    const backgroundArrays: string[] = [];

    const handleImageBackground = (node: NodesWithFillsAndStrokes) => {
        const image = `./${generateImageName(node.name, node.id, 'background')}`;
        backgroundArrays.length = 0; // Clear previous backgrounds since they will be exported as 1 image together
        backgroundArrays.push(`url(${image}) center / 100% 100% no-repeat`);
    };

    // If there are multiple special fills, do not create pseudo elements for them because we can't handle that in CSS. Instead we'll export them as an image.
    const specialFillsCount = fills.filter((fill) => SPECIAL_FILL_TYPES.includes(fill.type) && fill.visible).length;
    if (specialFillsCount > 1) {
        handleImageBackground(node);
        return `${backgroundArrays.join(', ')}`;
    }

    if (fills.filter((fill) => fill.type === 'SOLID' && fill.visible).length > 1) {
        handleImageBackground(node);
        return `${backgroundArrays.join(', ')}`;
    }

    fillLoop: for (const fill of fills) {
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

            case 'IMAGE':
            case 'PATTERN': {
                if (!fill.visible) break;
                handleImageBackground(node);
                break fillLoop; // Break out of the for loop since image overrides all other backgrounds
            }
        }
    }

    if (backgroundArrays.length === 0) return '';

    return `${backgroundArrays.join(', ')}`;
}

export function additionalBackgroundStyles(node: NodesWithFillsAndStrokes): string {
    let result = '';
    if (!node.fills || node.fills === figma.mixed) return result;

    // If there is an image it will all be exported as 1 image together
    if (hasImage(node.fills)) return result;

    // We need to check if there are special fill at all
    const specialFillCount = node.fills.filter((fill) => SPECIAL_FILL_TYPES.includes(fill.type) && fill.visible).length;
    if (!specialFillCount || specialFillCount === 0) {
        return result;
    }

    // If there are multiple special fills, do not create pseudo elements for them because we can't handle that in CSS. Instead we'll export them as an image.
    if (node.fills.length > 1 && specialFillCount > 1) {
        return result;
    }

    // If there is only 1 special fill, we can create a pseudo element for it
    for (const fill of node.fills) {
        switch (fill.type) {
            case 'GRADIENT_RADIAL': {
                const { gradient, rotation, size, position } = radialGradientHandle(fill, node.height, node.width);
                result = `
                    background: ${gradient};
                    transform: rotate(${rotation}deg) translate(-50%, -50%);
                    ${size}
                    ${position}
                `;
                break;
            }

            case 'GRADIENT_DIAMOND': {
                const { gradient, size, position, rotation } = diamondGradientHandle(fill, node.width, node.height);
                result += `
                    background: ${gradient};
                    transform: rotate(${rotation}deg) translate(-50%, -50%);
                    ${size}
                    ${position}
                `;
                break;
            }
        }
    }

    return result;
}

export async function generateBackgroundRect(node: NodesWithFillsAndStrokes): Promise<DOMRect> {
    const { fillGeometry } = node;

    // If there is no fillGeometry or it's empty, return a sensible default rect
    if (!fillGeometry || fillGeometry.length === 0) {
        return { x: 0, y: 0, width: 100, height: 100 } as DOMRect;
    }

    // Only proceed for SVG nodes
    if (!isNodeSVG(node)) {
        return { x: 0, y: 0, width: 100, height: 100 } as DOMRect;
    }

    const bbox = await getPathBBox(fillGeometry[0].data);

    if (!bbox) {
        return { x: 0, y: 0, width: 100, height: 100 } as DOMRect;
    }

    return {
        x: getPercentage(bbox.x, node.width),
        y: getPercentage(bbox.y, node.height),
        width: getPercentage(bbox.width, node.width),
        height: getPercentage(bbox.height, node.height),
    } as DOMRect;
}
