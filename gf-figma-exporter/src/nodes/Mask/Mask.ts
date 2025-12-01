import CSSExporter from '../../CSSExporter/CSSExporter';
import { flattenPathToPolygons } from '../../CSSExporter/utils/clipPath';
import { generateMaskStyle } from '../../CSSExporter/utils/mask';
import { getNodes } from '../../exporter';
import ImageExporter from '../../ImageExporter/ImageExporter';
import { ExportableNodes, MaskNode, SVGNodes } from '../../types/commonTypes';
import { combineFillAndStrokeToPathData } from '../../utils/combineFillAndStrokeToPathData';
import convertLuminanceToAlpha from '../../utils/convertLuminanceToAlpha';
import BaseNode from '../BaseNode';

class GFMask extends BaseNode {
    public html: string;
    public originalNode: ExportableNodes;

    constructor(node: MaskNode) {
        super(node);
        this.html = '';
        this.originalNode = node.originalNode;
    }

    async init() {
        if (!('maskChildren' in this.node) || this.node.maskChildren.length === 0) return;
        const { html, css, images } = await getNodes(this.node.maskChildren);
        this.html = html;
        this.additionalCSS = css;
        this.images = this.images.concat(images);
    }

    async createHTML(): Promise<string> {
        return `<div class="${this.className}">${this.html}</div>`;
    }

    async createCSS(): Promise<string> {
        const CSSExporterInstance = new CSSExporter(this.originalNode);

        if ((this.node as MaskNode).maskType === 'ALPHA') {
            const mask = generateMaskStyle(this.node);
            CSSExporterInstance.style.add('mask-image', `url(${mask})`);
            CSSExporterInstance.style.add('mask-size', '100% 100%');
            CSSExporterInstance.style.add('mask-repeat', 'no-repeat');

            const ImageExporterInstance = new ImageExporter();

            const image = await ImageExporterInstance.exportMaskImage(this.node as MaskNode);

            if (image) {
                this.images.push(image);
            }
        }

        if ((this.node as MaskNode).maskType === 'VECTOR') {
            const pathData = combineFillAndStrokeToPathData(this.originalNode as SVGNodes);
            const width = this.originalNode.width;
            const height = this.originalNode.height;

            if (pathData && width && height) {
                const clipPath = await flattenPathToPolygons(pathData, width, height);

                if (clipPath) {
                    CSSExporterInstance.style.add('clip-path', `polygon(${clipPath})`);
                }
            }
        }

        if ((this.node as MaskNode).maskType === 'LUMINANCE') {
            const mask = generateMaskStyle(this.node);
            CSSExporterInstance.style.add('mask-image', `url(${mask})`);
            CSSExporterInstance.style.add('mask-size', '100% 100%');
            CSSExporterInstance.style.add('mask-repeat', 'no-repeat');

            const ImageExporterInstance = new ImageExporter();

            const image = await ImageExporterInstance.exportMaskImage(this.node as MaskNode);

            if (image) {
                const convertedImage = await convertLuminanceToAlpha(image.data, this.originalNode.width, this.originalNode.height);
                this.images.push({
                    name: image.name,
                    data: convertedImage,
                });
            }
        }



        return `
        .${this.className} {
            ${await CSSExporterInstance.generateElementStyle()}
        }

        ${this.additionalCSS}`;
    }
}

export default GFMask;
