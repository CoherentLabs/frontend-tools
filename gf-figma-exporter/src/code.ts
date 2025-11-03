import getPages from './exporter';
import sanitizeNames from './utils/sanitizeNames';

figma.showUI(__html__);

figma.ui.onmessage = (msg: { type: string; count: number }) => {
    if (msg.type === 'create-shapes') {
        figma.skipInvisibleInstanceChildren = true;
        figma.notify('Generating code... This may take a while for large files.');
        getPages().then((pages) => {
            figma.notify('Code generated! Preparing files for download...');

            figma.ui.postMessage({
                type: 'download-files',
                pages,
                filename: sanitizeNames(figma.root.name || 'figma-export'),
            });

            figma.ui.onmessage = (msg: { type: string }) => {
                if (msg.type === 'close-plugin') {
                    figma.closePlugin();
                }
            };
        });
    }
};
