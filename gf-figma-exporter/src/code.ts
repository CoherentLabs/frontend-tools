import getPages, { getComponents } from './exporter';
import MessageBus from './MessageBus/MessageBus';
import MessageBus from './MessageBus/MessageBus';
import sanitizeNames from './utils/sanitizeNames';
import { ExportMode } from './types/commonTypes';

figma.showUI(__html__, { width: 500, height: 275});

MessageBus.on('start-export', (data) => {
    const { mode = 'page' } = (data as { mode?: ExportMode }) || {};
    figma.skipInvisibleInstanceChildren = true;
    const filename = sanitizeNames(figma.root.name || 'figma-export');

    if (mode === 'component') {
        getComponents().then((result) => {
            figma.notify('Code generated! Preparing files for download...');
            MessageBus.postMessage('download-files', { mode, payload: result, filename });
        });
    } else {
        getPages().then((pages) => {
            figma.notify('Code generated! Preparing files for download...');
            MessageBus.postMessage('download-files', { mode, payload: pages, filename });
        });
    }
});

MessageBus.on('close-plugin', () => {
    figma.closePlugin();
});
