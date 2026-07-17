import CSSExporter from '../../CSSExporter/CSSExporter';
import { generateMaskStyle, getMaskPosition } from '../../CSSExporter/utils/mask';
import { generatePosition } from '../../CSSExporter/utils/position';
import { getNodes } from '../../exporter';
import ImageExporter, { getMaskBleedBounds, MaskBleedBounds } from '../../ImageExporter/ImageExporter';
import { ExportableNodes, MaskNode, NodesWithFillsAndStrokes, PrimitiveNodes } from '../../types/commonTypes';
import convertLuminanceToAlpha from '../../utils/convertLuminanceToAlpha';
import { convertPXtoVH } from '../../utils/convertUnits';
import getParentSize from '../../utils/parentSize';
import BaseNode from '../BaseNode';

// Same bleed issue as the background-fill fix: the wrapper's own box (sized/positioned from the node's
// plain bounding box) can clip masked content that legitimately bleeds beyond it (e.g. a TEXTURE effect
// with clipToShape: false). Shifts an existing percentage (relative to parentSizePx) by offsetPx, the
// same offsetX/offsetY relationship getMaskBleedBounds already exposes.
function shiftPercentage(percentage: string, offsetPx: number, parentSizePx: number): string {
    if (!parentSizePx) return percentage;

    const currentPx = (parseFloat(percentage) / 100) * parentSizePx;
    const shiftedPx = currentPx - offsetPx;

    return `${((shiftedPx / parentSizePx) * 100).toFixed(2)}%`;
}

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

        // hasBleed is decided exactly once here, self-consistently (see getMaskBleedBounds), and reused
        // everywhere below (mask-size/position, image export, wrapper sizing) — every mask is either
        // handled entirely by the normal path or entirely by the bleed path, never a mix of both.
        const bleedBounds = getMaskBleedBounds(this.originalNode as unknown as SceneNode);
        const hasBleed = !!bleedBounds && bleedBounds.hasBleed;

        await this.applyMaskImage(CSSExporterInstance, hasBleed, bleedBounds);

        await CSSExporterInstance.generateElementStyle(); // populates style as a side effect

        if (hasBleed && bleedBounds) {
            this.applyBleedSizing(CSSExporterInstance, bleedBounds);
        }

        return `
        .${this.className} {
            ${CSSExporterInstance.style.getCSS()}
        }

        ${this.additionalCSS}`;
    }

    // Every mask is exported as an image, regardless of type — a VECTOR mask no longer gets a clip-path
    // alternative. clip-path is a hard cut that can never show bled content past its exact polygon, and
    // its percentages are computed against the node's un-expanded box, so it could never correctly
    // reflect a bleeding mask's true extent, and it also had no reliable way to signal back to a masked
    // child's own position math (position.ts) whether the wrapper had actually been resized for bleed or
    // not. A single, uniform image-based path removes that whole class of mismatch.
    private async applyMaskImage(
        CSSExporterInstance: CSSExporter,
        hasBleed: boolean,
        bleedBounds: MaskBleedBounds | null
    ): Promise<void> {
        const maskType = (this.node as MaskNode).maskType;
        if (maskType !== 'ALPHA' && maskType !== 'VECTOR' && maskType !== 'LUMINANCE') return;

        const mask = generateMaskStyle(this.node);
        // Once the wrapper itself is resized to bleedBounds (applyBleedSizing), the exported mask image
        // (already sized to those exact same bounds — see exportMaskImage) fills it perfectly, so the
        // oversized/offset percentage math getMaskPosition does for the non-bleeding stroke-outset case
        // is unnecessary — and, more importantly, would be wrong here since it's derived from the node's
        // original, un-expanded box, not the now-expanded wrapper.
        const { x, y, width, height } = hasBleed
            ? { x: 0, y: 0, width: '100', height: '100' }
            : await getMaskPosition(this.originalNode as NodesWithFillsAndStrokes);

        CSSExporterInstance.style.add('mask-image', `url(${mask})`);
        CSSExporterInstance.style.add('mask-size', `${width}% ${height}%`);
        CSSExporterInstance.style.add('mask-repeat', 'no-repeat');
        CSSExporterInstance.style.add('mask-position', `${x}% ${y}%`);

        const ImageExporterInstance = new ImageExporter();
        const image = await ImageExporterInstance.exportMaskImage(this.node as MaskNode, bleedBounds);
        if (!image) return;

        if (maskType === 'LUMINANCE') {
            const convertedImage = await convertLuminanceToAlpha(image.data, this.originalNode.width, this.originalNode.height);
            this.images.push({ name: image.name, data: convertedImage });
            return;
        }

        this.images.push(image);
    }

    // A bleeding mask can't reliably participate in flex layout — its true rendered size includes bleed
    // that flex sizing can't account for. Force it back to absolute positioning (using Figma's own
    // already-resolved auto-layout position, the same source any non-flex node already uses) instead of
    // flex flow, regardless of whether it's nominally a flex item — this intentionally takes it out of
    // the flex flow, so its siblings will re-flow as if it weren't a flex item at all. Only ever called
    // when hasBleed is true — a normal mask never has its size/position touched here.
    private async applyBleedSizing(CSSExporterInstance: CSSExporter, bleedBounds: MaskBleedBounds): Promise<void> {
        CSSExporterInstance.style.add('width', `${convertPXtoVH(bleedBounds.width).toFixed(2)}vh`);
        CSSExporterInstance.style.add('height', `${convertPXtoVH(bleedBounds.height).toFixed(2)}vh`);
        CSSExporterInstance.style.add('position', 'absolute');
        CSSExporterInstance.style.remove('flex');
        CSSExporterInstance.style.remove('align-self');

        const { top, left } = await generatePosition(this.originalNode as PrimitiveNodes);
        const parentSize = getParentSize(this.originalNode.parent);

        CSSExporterInstance.style.add('left', shiftPercentage(left, bleedBounds.offsetX, parentSize.width));
        CSSExporterInstance.style.add('top', shiftPercentage(top, bleedBounds.offsetY, parentSize.height));
    }
}

export default GFMask;
