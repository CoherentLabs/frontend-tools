import { parseTextStyle } from '../../utils/parseTextStyle';
import { TextSegment } from '../../types/commonTypes';
import generateClassName from '../../utils/generateClassName';
import CSSExporter from '../../CSSExporter/CSSExporter';

class GFTextNode {
    node: TextNode;
    textSegments: TextSegment[];
    images: { name: string; data: Uint8Array | null }[];
    className: string;

    constructor(node: TextNode) {
        this.node = node;
        this.textSegments = parseTextStyle(node);
        this.images = [];
        this.className = generateClassName('text-node', this.node.id);
    }

    async createHTML(): Promise<string> {
        let innerHTML = '';
        for (const [index, segment] of this.textSegments.entries()) {
            innerHTML += `<span class="${this.className}-${index}">${segment.characters}</span>`;
        }

        return `<p cohinline class="${this.className}">${innerHTML}</p>`;
    }

    async createCSS(): Promise<string> {
        const CSSExporterInstance = new CSSExporter(this.node);
        CSSExporterInstance.style.add('white-space', 'pre-wrap');
        let css = `.${this.className} {
            ${CSSExporterInstance.generateElementStyle()}
        }
        \n\n`;
        for (const [index, segment] of this.textSegments.entries()) {
            css += `.${this.className}-${index} {
               ${await CSSExporter.generateTextElementStyle(segment)}
            }\n\n`;
        }

        return css;
    }
}

export default GFTextNode;
