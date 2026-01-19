import FontExporter from '../FontExporter/FontExporter';
import { isItalicStyle } from '../FontExporter/utils/parseStyleUtils';

export default function createCSSFontRules() {
    let result = '';

    const fonts = FontExporter.fontMap;
    for (const font of Object.keys(fonts)) {
        for (const weight of Object.keys(fonts[font])) {
            for (const style of Object.keys(fonts[font][weight])) {
                for (const subset of Object.keys(((fonts[font])[weight])[style].subsets)) {
                    if (((fonts[font])[weight])[style].subsets[subset] === null) continue;
                    result += `@font-face {
                                font-family: '${fonts[font][weight][style].fontName}${subset === 'latin' ? '' : ` ${subset}`}';
                                font-style: ${isItalicStyle(style) ? 'italic' : 'normal'};
                                font-weight: ${weight};
                                src: url('./fonts/${font}-${style}_${weight}_${subset}.ttf');
                            }\n`;
                }
            }
        }
    }
    return result;
}
