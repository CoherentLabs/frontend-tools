export default function getPathBBox(path: string): Promise<DOMRect> {
    return new Promise((resolve) => {
        figma.ui.postMessage({
            type: 'path-bbox',
            options: { path },
        });

        figma.ui.onmessage = (msg) => {
            if (msg.type === 'path-bbox-result') {
                resolve(msg.bbox);
            }
        };
    });
}
