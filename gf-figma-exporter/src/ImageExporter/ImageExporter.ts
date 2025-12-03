import { ExportableNodes, MaskNode, NodesWithFillsAndStrokes } from '../types/commonTypes';
import toggleChildren from '../utils/toggleChildren';
import handleImage from './utils/handleImages';
import shouldExportBackground from './utils/shouldExportBackground';
import shouldExportStroke from './utils/shouldExportStroke';
import {
    disableMask,
    enableMask,
    hideEffects,
    hideFills,
    hideStrokes,
    removeRotation,
    restoreEffects,
    restoreFills,
    restoreRotation,
    restoreStrokes,
} from './utils/toggleUtils';

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
        if (!shouldExportBackground(node)) return null;

        if (node.type === 'FRAME') {
            // Temporarily hide children to avoid exporting them in the background image
            toggleChildren(node, false);
        }

        const strokes = node.strokes;
        const effects = node.effects;
        const rotation = node.rotation;

        // Hide strokes and effects to export only the background

        hideStrokes(node);
        hideEffects(node);
        await disableMask(node);
        removeRotation(node);

        const { name, data } = await handleImage(node, 'background', 'PNG');
        if (!data) return null;

        if (node.type === 'FRAME') {
            // Restore children visibility
            toggleChildren(node, true);
        }

        restoreStrokes(node, strokes);
        restoreEffects(node, effects);
        await enableMask(node);
        restoreRotation(node, rotation);

        return {
            name,
            data,
        };
    }

    async exportStrokeImage(node: NodesWithFillsAndStrokes): Promise<{ name: string; data: Uint8Array | null } | null> {
        if (!shouldExportStroke(node)) return null;

        const fills = node.fills;
        const effects = node.effects;
        const rotation = node.rotation;
        // Hide fills and effects to export only the stroke

        if (node.type === 'FRAME') {
            // Temporarily hide children to avoid exporting them in the background image
            toggleChildren(node, false);
        }

        hideFills(node);
        hideEffects(node);
        removeRotation(node);
        await disableMask(node);

        const { name, data } = await handleImage(node, 'border', 'PNG');
        if (!data) return null;

        restoreFills(node, fills);
        restoreEffects(node, effects);
        restoreRotation(node, rotation);
        await enableMask(node);

        if (node.type === 'FRAME') {
            // Restore children visibility
            toggleChildren(node, true);
        }

        return {
            name,
            data,
        };
    }

    async exportImage(node: ExportableNodes): Promise<{ name: string; data: Uint8Array | null } | null> {
        return await handleImage(node as SceneNode, 'full', 'PNG');
    }

    async exportMaskImage(node: MaskNode): Promise<{ name: string; data: Uint8Array | null } | null> {
        node.originalNode.isMask = false;

        const originalName = node.originalNode.name;
        node.originalNode.name = node.name;

        const result = await this.exportImage(node.originalNode);

        node.originalNode.name = originalName;

        node.originalNode.isMask = true;
        return result;
    }

    static shouldExportImage(node: NodesWithFillsAndStrokes): boolean {
        if (shouldExportBackground(node) || shouldExportStroke(node)) {
            return true;
        }
        return false;
    }
}

export default ImageExporter;
