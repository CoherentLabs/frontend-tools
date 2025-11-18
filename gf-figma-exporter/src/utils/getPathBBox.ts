import MessageBus from '../MessageBus/MessageBus';

export default function getPathBBox(path: string): Promise<DOMRect> {
    return new Promise((resolve) => {
        MessageBus.postMessage('path-bbox', { path });

        MessageBus.on('path-bbox-result', (data: unknown) => {
            const bbox = data as DOMRect;
            resolve(bbox);
        });
    });
}
