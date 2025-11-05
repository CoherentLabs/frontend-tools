import { NodesWithFillsAndStrokes, SVGNodes } from '../../types/commonTypes';
import { convertPXtoVH } from '../../utils/convertUnits';
import createRGBAColor from '../../utils/createRGBAColor';
import isNodeSVG from '../../utils/isNodeSVG';

export function generateEffectStyles(node: SVGNodes | NodesWithFillsAndStrokes): {
    boxShadow: string;
    filter: string;
    backDropFilter: string;
} {
    const { effects } = node;

    if (!effects || effects.length === 0) {
        return { boxShadow: '', filter: '', backDropFilter: '' };
    }

    const boxShadows: string[] = [];
    const filters: string[] = [];
    const backDropFilters: string[] = [];

    for (const effect of effects) {
        if (!effect.visible) continue;

        switch (effect.type) {
            case 'DROP_SHADOW': {
                filters.push(`drop-shadow(${buildShadow(effect)})`);

                break;
            }

            case 'INNER_SHADOW': {
                if (isNodeSVG(node)) break;

                boxShadows.push(`inset ${buildShadow(effect)}`);
                break;
            }

            case 'LAYER_BLUR': {
                if (effect.blurType === 'PROGRESSIVE') break;

                filters.push(`blur(${convertPXtoVH(effect.radius)}em)`);
                break;
            }

            case 'BACKGROUND_BLUR': {
                if (effect.blurType === 'PROGRESSIVE') break;

                backDropFilters.push(`blur(${convertPXtoVH(effect.radius)}em)`);
                break;
            }

            case 'GLASS': {
                break;
            }

            default:
                break;
        }
    }

    return {
        boxShadow: boxShadows.join(', '),
        filter: filters.join(' '),
        backDropFilter: backDropFilters.join(' '),
    };
}

function buildShadow(effect: DropShadowEffect | InnerShadowEffect): string {
    return `${convertPXtoVH(effect.offset.x)}em ${convertPXtoVH(effect.offset.y)}em ${convertPXtoVH(effect.radius)}em ${
        effect.spread ? convertPXtoVH(effect.spread) + 'em' : ''
    } ${createRGBAColor(effect.color.r, effect.color.g, effect.color.b, effect.color.a)}`;
}
// export as images innerShadow for SVG, progressive blur

// not supported - progressive background blur
