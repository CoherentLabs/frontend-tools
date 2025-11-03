import CSSExporter from '../../CSSExporter/CSSExporter';
import { createClipPath } from '../../CSSExporter/utils/clipPath';
import ImageExporter from '../../ImageExporter/ImageExporter';
import { NodesWithFillsAndStrokes, SVGNodes } from '../../types/commonTypes';
import { BACKGROUND_SUFFIX } from '../../utils/constants';
import GFBaseNode from '../BaseNode';

export default class GFSVGNode extends GFBaseNode {
    constructor(public node: SVGNodes) {
        super(node);
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

        if (!background) { //Avoid calling postmessage if we are exporting background as image
            // Create clip-path only if we are not exporting background as image
            const clipPath = await createClipPath(this.node);

            if (clipPath) {
                CSSExporterInstance.backgroundStyles.add('clip-path', clipPath);
            }
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
            ${CSSExporterInstance.generateElementStyle()}
        }

        .${this.className}${BACKGROUND_SUFFIX} {
            ${await CSSExporterInstance.generateBackgroundElementStyle()}
        }

        ${beforePseudo}
        ${afterPseudo}`;
    }
}
