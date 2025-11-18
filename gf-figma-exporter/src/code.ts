import getPages from './exporter';
import MessageBus from './MessageBus/MessageBus';
import sanitizeNames from './utils/sanitizeNames';

figma.showUI(__html__, { width: 500, height: 300 });

MessageBus.on('create-shapes', () => {
    figma.skipInvisibleInstanceChildren = true;
    figma.notify('Generating code... This may take a while for large files.');
    getPages().then((pages) => {
        figma.notify('Code generated! Preparing files for download...');

        MessageBus.postMessage('download-files', { pages, filename: sanitizeNames(figma.root.name || 'figma-export') });
    });
});

MessageBus.on('close-plugin', () => {
    figma.closePlugin();
});
