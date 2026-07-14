import CSSExporter from '../../CSSExporter/CSSExporter';
import { createClipPath } from '../../CSSExporter/utils/clipPath';
import ImageExporter, { getExportStageBounds } from '../../ImageExporter/ImageExporter';
import { NodesWithFillsAndStrokes, SVGNodes } from '../../types/commonTypes';
import { convertPXtoVH } from '../../utils/convertUnits';
import { BACKGROUND_SUFFIX } from '../../utils/constants';
import hasUnsupportedSVGFeatures from '../../utils/hasUnsupportedSVGFeatures';
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

        await CSSExporterInstance.generateBackgroundElementStyle(); // populates backgroundStyles as a side effect

        if (!background) { //Avoid calling postmessage if we are exporting background as image
            // Create clip-path only if we are not exporting background as image
            const { clipPath, isTooComplex } = await createClipPath(this.node);

            if (clipPath) {
                CSSExporterInstance.backgroundStyles.add('clip-path', clipPath);
            } else if (isTooComplex) {
                // Gameface's SVG renderer doesn't support <pattern> (used for image/pattern fills and
                // strokes) and effects aren't verified either — fall back to PNG for those instead of SVG.
                const image = hasUnsupportedSVGFeatures(this.node)
                    ? await ImageExporterInstance.exportVectorAsPNG(this.node)
                    : await ImageExporterInstance.exportVectorAsSVG(this.node);

                if (image) {
                    this.images.push(image);

                    // generateBackgroundElementStyle() already sized this div from fillGeometry's bbox —
                    // the shape's own path bounds, which don't include effect bleed (e.g. a texture/blur
                    // effect with clipToShape: false). The exported image itself is rasterized to the full
                    // render bounds (see exportVectorClean), so the div needs the same box, or the image
                    // ends up squashed/cropped to fit a box sized for the un-bled shape instead.
                    const bounds = getExportStageBounds(this.node as unknown as SceneNode);
                    if (bounds) {
                        CSSExporterInstance.backgroundStyles.add('width', `${convertPXtoVH(bounds.width).toFixed(2)}vh`);
                        CSSExporterInstance.backgroundStyles.add('height', `${convertPXtoVH(bounds.height).toFixed(2)}vh`);
                        CSSExporterInstance.backgroundStyles.add('left', `${(-convertPXtoVH(bounds.offsetX)).toFixed(2)}vh`);
                        CSSExporterInstance.backgroundStyles.add('top', `${(-convertPXtoVH(bounds.offsetY)).toFixed(2)}vh`);
                    }

                    CSSExporterInstance.backgroundStyles.add(
                        'background',
                        `url(./${image.name}) center / 100% 100% no-repeat`
                    );
                }
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
            ${await CSSExporterInstance.generateElementStyle()}
        }

        .${this.className}${BACKGROUND_SUFFIX} {
            ${CSSExporterInstance.backgroundStyles.getCSS()}
        }

        ${beforePseudo}
        ${afterPseudo}`;
    }
}
