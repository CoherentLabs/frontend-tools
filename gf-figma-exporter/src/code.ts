import getPages from './exporter';
import sanitizeNames from './utils/sanitizeNames';

figma.showUI(__html__);

figma.ui.onmessage = (msg: { type: string; count: number }) => {
    if (msg.type === 'create-shapes') {

        const pages = getPages();
        figma.notify('Code generated! Preparing files for download...');

        figma.ui.postMessage({
            type: 'download-files',
            pages,
            filename: sanitizeNames(figma.root.name || 'figma-export'),
        });
    }

    if (msg.type === 'close-plugin') {
        figma.closePlugin();
    }
};
