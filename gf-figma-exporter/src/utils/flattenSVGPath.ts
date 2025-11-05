// We need to call postMessage on the figma.ui to leverage the browser's SVG capabilities as Figma's plugin environment does not support SVG manipulation natively.
export default async function flattenSVGPath(
    path: string,
    width: number,
    height: number,
    tolerance = 0.5
): Promise<{ x: number; y: number }[]> {
    return new Promise((resolve) => {
        figma.ui.postMessage({
            type: 'flatten-svg',
            options: { path, width, height, tolerance },
        });

        figma.ui.onmessage = (msg) => {
            if (msg.type === 'flattened-svg-result') {
                resolve(msg.points);
            }
        };
    });
}
