import getPages from './exporter';
import MessageBus from './MessageBus/MessageBus';
import sanitizeNames from './utils/sanitizeNames';

figma.showUI(__html__, { width: 500, height: 250});

MessageBus.on('start-export', () => {
    figma.skipInvisibleInstanceChildren = true;
    getPages().then((pages) => {
        figma.notify('Code generated! Preparing files for download...');
        MessageBus.postMessage('download-files', { pages, filename: sanitizeNames(figma.root.name || 'figma-export') });
    });
});

MessageBus.on('close-plugin', () => {
    figma.closePlugin();
});
