import { ExportableNodes, MaskNode, NodesWithFillsAndStrokes } from '../types/commonTypes';
import { currentPageSize } from '../utils/currentPage';
import toggleChildren from '../utils/toggleChildren';
import handleImage from './utils/handleImages';
import shouldExportBackground from './utils/shouldExportBackground';
import shouldExportStroke from './utils/shouldExportStroke';
import {
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

        return await this.exportCleanImage(node, 'background');
    }

    async exportStrokeImage(node: NodesWithFillsAndStrokes): Promise<{ name: string; data: Uint8Array | null } | null> {
        if (!shouldExportStroke(node)) return null;

        return await this.exportCleanImage(node, 'border');
    }

    private async exportCleanImage(
        node: NodesWithFillsAndStrokes,
        type: 'background' | 'border' | 'full'
    ): Promise<{ name: string; data: Uint8Array | null } | null> {
        const clone = node.clone() as NodesWithFillsAndStrokes;
        const exportStage = figma.createFrame();
        exportStage.name = 'TEMP EXPORT STAGE';
        exportStage.fills = []; // Transparent
        exportStage.x = 100000; // Move far away so user doesn't see flicker
        exportStage.resize(currentPageSize.width, currentPageSize.height);
        figma.currentPage.appendChild(exportStage);
        exportStage.appendChild(clone);

        if (clone.type === 'FRAME') {
            // Temporarily hide children to avoid exporting them in the background image
            toggleChildren(clone, false);
        }

        const strokes = clone.strokes;
        const fills = clone.fills;
        const effects = node.effects;
        const rotation = node.rotation;

        // Hide strokes and effects to export only the background

        type === 'border' ? hideFills(clone) : hideStrokes(clone);
        hideEffects(clone);
        removeRotation(clone);

        const { name, data } = await handleImage(clone, type, 'PNG', node.id);
        if (!data) return null;

        if (clone.type === 'FRAME') {
            // Restore children visibility
            toggleChildren(clone, true);
        }

        type === 'border' ? restoreFills(clone, fills) : restoreStrokes(clone, strokes);
        restoreEffects(clone, effects);
        restoreRotation(clone, rotation);

        exportStage.remove();

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
