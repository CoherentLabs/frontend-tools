import { TextSegment } from './../../types/commonTypes';
import { convertPXtoVH, getPercentage } from '../../utils/convertUnits';
import createRGBAColor from '../../utils/createRGBAColor';
import getSubsetFromCharacters from '../../FontExporter/utils/getSubsetFromCharacters';
import { getFontWidth, getFontWidthSuffix, isItalicStyle } from '../../FontExporter/utils/parseStyleUtils';
import sanitizeFontName from '../../FontExporter/utils/sanitizeFontName';
import FontExporter from '../../FontExporter/FontExporter';

//We are only handling solid fills as we don't support background-clip in Gameface
export function getTextColor(textSegment: TextSegment): string {
    return textSegment.fills && textSegment.fills[0] && textSegment.fills[0].type === 'SOLID'
        ? createRGBAColor(
              textSegment.fills[0].color.r,
              textSegment.fills[0].color.g,
              textSegment.fills[0].color.b,
              textSegment.fills[0].opacity
          )
        : 'inherit';
}

export function getFontSize(textSegment: TextSegment): string {
    return convertPXtoVH(textSegment.fontSize).toFixed(2);
}

export function getLetterSpacing(textSegment: TextSegment): string {
    const { letterSpacing } = textSegment;

    if (letterSpacing.unit === 'PERCENT') {
        return `${letterSpacing.value / 100}em`;
    }

    const letterSpacingInVH = convertPXtoVH(letterSpacing.value as number);
    const letterSpacingInPercent = getPercentage(letterSpacingInVH, parseFloat(getFontSize(textSegment)));

    return `${letterSpacingInPercent / 100}em`;
}

export function getLineHeight(textSegment: TextSegment): string {
    const { lineHeight } = textSegment;
    if (lineHeight.unit === 'AUTO') {
        return 'normal';
    }

    if (lineHeight.unit === 'PERCENT') {
        return `${lineHeight.value / 100}`;
    }

    const lineHeightInVH = convertPXtoVH(lineHeight.value as number);
    const lineHeightInPercent = getPercentage(lineHeightInVH, parseFloat(getFontSize(textSegment)));
    return `${lineHeightInPercent / 100}`;
}

export function getTextCase(textSegment: TextSegment): string {
    switch (textSegment.textCase) {
        case 'UPPER':
            return 'uppercase';
        case 'LOWER':
            return 'lowercase';
        case 'TITLE':
            return 'capitalize';
        default:
            return 'none';
    }
}

export function getFontData(textSegment: TextSegment): { family: string; style: string } {
    return {
        family: textSegment.fontName.family,
        style: textSegment.fontName.style,
    };
}

export function getTextDecoration(
    textSegment: TextSegment
): { style: string; color: string; thickness: string; offset: string } | null {
    if (textSegment.textDecoration === 'NONE') {
        return null;
    }

    const style = getTextDecorationType(textSegment.textDecoration);
    const color = getTextDecorationColor(textSegment);
    const thickness = getTextDecorationThickness(textSegment);
    const offset = getTextDecorationOffset(textSegment);

    return {
        style,
        color,
        thickness,
        offset,
    };
}
function getTextDecorationType(textDecoration: TextDecoration): string {
    switch (textDecoration) {
        case 'UNDERLINE':
            return 'underline';
        case 'STRIKETHROUGH':
            return 'line-through';
        default:
            return 'none';
    }
}

function getTextDecorationColor(textSegment: TextSegment): string {
    const { textDecorationColor } = textSegment;

    if (textDecorationColor === null) return getTextColor(textSegment);

    if (textDecorationColor.value === 'AUTO') return getTextColor(textSegment);
    if (textDecorationColor.value.type !== 'SOLID') return 'rgba(0, 0, 0, 1)'; // Default to black since CSS doesn't support complex text decoration colors

    const { r, g, b } = textDecorationColor.value.color;
    const a = textDecorationColor.value.opacity !== undefined ? textDecorationColor.value.opacity : 1;

    return createRGBAColor(r, g, b, a);
}

function getTextDecorationThickness(textSegment: TextSegment): string {
    const { textDecorationThickness } = textSegment;

    if (textDecorationThickness === null || textDecorationThickness.unit === 'AUTO') return 'auto';

    if (textDecorationThickness.unit === 'PERCENT') {
        return `${textDecorationThickness.value}%`;
    }

    const thicknessInVH = convertPXtoVH(textDecorationThickness.value as number);
    const thicknessInPercent = getPercentage(thicknessInVH, parseFloat(getFontSize(textSegment)));

    return `${thicknessInPercent}%`;
}

function getTextDecorationOffset(textSegment: TextSegment): string {
    const { textDecorationOffset } = textSegment;

    if (textDecorationOffset === null || textDecorationOffset.unit === 'AUTO') return 'auto';

    if (textDecorationOffset.unit === 'PERCENT') {
        return `${textDecorationOffset.value}%`;
    }

    const offsetInVH = convertPXtoVH(textDecorationOffset.value as number);
    const offsetInPercent = getPercentage(offsetInVH, parseFloat(getFontSize(textSegment))) ;
    return `${offsetInPercent}%`;
}

export function getFontName(textSegment: TextSegment): string {
    const result: string[] = [];
    const width = getFontWidth(textSegment.fontName.style);
    let id = sanitizeFontName(textSegment.fontName.family)+getFontWidthSuffix(width);
    if (!FontExporter.fontMap[id]) {
        // Fallback to Noto Sans if the font is not available
        id = 'noto-sans';
    }
    const subsets = getSubsetFromCharacters(textSegment.characters);
    const style = isItalicStyle(textSegment.fontName.style) ? 'italic' : 'regular';
    const weight = textSegment.fontWeight;

    subsets.forEach((subset) => {
        const fontName =  FontExporter.fontMap[id][weight][style].fontName;
        const subsetName = subset === 'latin' ? '' : ` ${subset}`;
        if (FontExporter.fontMap[id][weight][style].subsets[subset]) {
            result.push(`'${fontName}${subsetName}'`);
        } else {
            // Fallback to Noto Sans if the subset is not available
            result.push(`'Noto Sans${subsetName}'`);
        }
    });

    return result.join(', ');
}

export function getTextStroke(node: TextNode): { color: string; width: string } | null {
    if (node.strokes.length === 0) {
        return null;
    }

    const stroke = node.strokes[0]; // Assuming only solid strokes are used
    if (stroke.type !== 'SOLID') {
        return null;
    }

    const color = createRGBAColor(stroke.color.r, stroke.color.g, stroke.color.b, stroke.opacity);
    if (node.strokeWeight === 0 || node.strokeWeight === undefined || node.strokeWeight === figma.mixed) {
        return null;
    }
    const width = convertPXtoVH(node.strokeWeight).toFixed(2);

    return { color, width };
}