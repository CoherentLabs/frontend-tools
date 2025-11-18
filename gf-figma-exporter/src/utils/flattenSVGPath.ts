import MessageBus from '../MessageBus/MessageBus';

// We need to call postMessage on the figma.ui to leverage the browser's SVG capabilities as Figma's plugin environment does not support SVG manipulation natively.
export default async function flattenSVGPath(
    path: string,
    width: number,
    height: number,
    tolerance = 0.5
): Promise<{ x: number; y: number }[]> {
    return new Promise((resolve) => {
        MessageBus.postMessage('flatten-svg', {
            path,
            width,
            height,
            tolerance,
        });

        MessageBus.on('flattened-svg-result', (data: unknown) => {
            const points = data as { x: number; y: number }[];
            resolve(points);
        });
    });
}
