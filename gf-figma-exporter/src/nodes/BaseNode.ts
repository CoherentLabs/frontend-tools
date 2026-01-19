import CSSExporter from '../CSSExporter/CSSExporter';
import ImageExporter from '../ImageExporter/ImageExporter';
import { ExportableNodes, GFImage, NodesWithFillsAndStrokes } from '../types/commonTypes';
import { isAutoLayoutNode } from '../utils/autoLayoutUtils';
import { BACKGROUND_SUFFIX, FLEX_SUFFIX } from '../utils/constants';
import generateClassName from '../utils/generateClassName';

export default class GFBaseNode {
    public node: ExportableNodes;
    public className: string;
    public images: GFImage[] = [];
    public additionalCSS: string;
    public isAutoLayout: boolean;

    constructor(node: ExportableNodes) {
        this.node = node;
        this.className = generateClassName(this.node.name, this.node.id);
        this.additionalCSS = '';
        this.isAutoLayout = isAutoLayoutNode(node as FrameNode);
    }

    async createHTML(): Promise<string> {
        if ('fills' in this.node && this.node.fills !== figma.mixed && this.node.fills.length === 0) {
            return `<div class="${this.className}"></div>`;
        }
        return `<div class="${this.className}"><div class="${this.className}${BACKGROUND_SUFFIX}"></div></div>`;
    }

    async createCSS(): Promise<string> {
        let beforePseudo = '';
        let afterPseudo = '';

        const CSSExporterInstance = new CSSExporter(this.node);
        const ImageExporterInstance = new ImageExporter();

        const { background, border } = await ImageExporterInstance.export(this.node as NodesWithFillsAndStrokes);

        if (background) {
            this.images.push(background);
        }

        if (border) {
            this.images.push(border);
        }
        
        const beforePseudoStyles = CSSExporterInstance.generateBeforePseudo();
        if (beforePseudoStyles) 
            beforePseudo = `.${this.className}${BACKGROUND_SUFFIX}::before {
            ${beforePseudoStyles}
        }`;

        const afterPseudoStyles = await CSSExporterInstance.generateAfterPseudo();
        if (afterPseudoStyles) 
            afterPseudo = `.${this.className}::after {
            ${afterPseudoStyles}
        }`;

        return `
        .${this.className} {
            ${await CSSExporterInstance.generateElementStyle()}
        }

        .${this.className}${BACKGROUND_SUFFIX} {
            ${await CSSExporterInstance.generateBackgroundElementStyle()}
        }

        ${this.isAutoLayout ? `.${this.className}${FLEX_SUFFIX} {
            ${await CSSExporterInstance.setFlexContainerStyle()}
        }` : ''}

        ${beforePseudo}
        ${afterPseudo}
        ${this.additionalCSS}`;
    }
}
