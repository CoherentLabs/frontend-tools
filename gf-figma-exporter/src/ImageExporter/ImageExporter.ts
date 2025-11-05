import { NodesWithFillsAndStrokes } from '../types/commonTypes';
import toggleChildren from '../utils/toggleChildren';
import handleImage from './utils/handleImages';
import shouldExportBackground from './utils/shouldExportBackground';
import shouldExportStroke from './utils/shouldExportStroke';
import { hideEffects, hideFills, hideStrokes, restoreEffects, restoreFills, restoreStrokes } from './utils/toggleUtils';

interface GFBackgroundAndStroke {
    background: {
        name: string;
        data: Uint8Array | null;
    } | null;
    border: {
        name: string;
        data: Uint8Array | null;
    } | null;
}

class ImageExporter {
    async export(node: NodesWithFillsAndStrokes): Promise<GFBackgroundAndStroke> {
        const result: GFBackgroundAndStroke = {
            background: null,
            border: null,
        };

        result.background = await this.exportBackgroundImage(node);
        result.border = await this.exportStrokeImage(node);

        return result;
    }

    async exportBackgroundImage(
        node: NodesWithFillsAndStrokes
    ): Promise<{ name: string; data: Uint8Array | null } | null> {
        if (!shouldExportBackground(node.fills)) return null;

        if (node.type === 'FRAME') {
            // Temporarily hide children to avoid exporting them in the background image
            toggleChildren(node, false);
        }

        const strokes = node.strokes;
        const effects = node.effects;

        // Hide strokes and effects to export only the background

        hideStrokes(node);
        hideEffects(node);

        const { name, data } = await handleImage(node, 'background', 'PNG');
        if (!data) return null;

        if (node.type === 'FRAME') {
            // Restore children visibility
            toggleChildren(node, true);
        }

        restoreStrokes(node, strokes);
        restoreEffects(node, effects);

        return {
            name,
            data,
        };
    }

    async exportStrokeImage(node: NodesWithFillsAndStrokes): Promise<{ name: string; data: Uint8Array | null } | null> {
        if (!shouldExportStroke(node)) return null;


        const fills = node.fills;
        const effects = node.effects;
        // Hide fills and effects to export only the stroke

        if (node.type === 'FRAME') {
            // Temporarily hide children to avoid exporting them in the background image
            toggleChildren(node, false);
        }

        hideFills(node);
        hideEffects(node);

        const { name, data } = await handleImage(node, 'border', 'PNG');
        if (!data) return null;

        restoreFills(node, fills);
        restoreEffects(node, effects);

        if (node.type === 'FRAME') {
            // Restore children visibility
            toggleChildren(node, true);
        }

        return {
            name,
            data,
        };
    }

    async exportFullImage(node: SceneNode, type: 'SVG' | 'PNG'): Promise<{ name: string; data: Uint8Array | null } | null> {
        const { name, data } = await handleImage(node, 'full', type);
        if (!data) return null;

        return {
            name,
            data,
        };
    }

}

export default ImageExporter;
