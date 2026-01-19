import MessageBus from "../MessageBus/MessageBus";

type FlattenSVGData = {
    path: string,
    width: number,
    height: number,
    tolerance: number;
};

export default function flattenSVG(data: FlattenSVGData) {
    const { path, width, height, tolerance } = data;
    const SVG_NS = 'http://www.w3.org/2000/svg';

    // Create the SVG
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', `${width}`);
    svg.setAttribute('height', `${height}`);

    // Create a path
    const pathElement = document.createElementNS(SVG_NS, 'path');
    pathElement.setAttribute('d', path);

    svg.appendChild(pathElement);

    // Calculate the total length of the path
    const totalLength = pathElement.getTotalLength();
    const points = [];

    // Sample points along the path based on the tolerance
    for (let length = 0; length <= totalLength; length += tolerance) {
        const point = pathElement.getPointAtLength(length);
        points.push({ x: point.x, y: point.y });
    }

    MessageBus.postMessage('flattened-svg-result', points);
}
