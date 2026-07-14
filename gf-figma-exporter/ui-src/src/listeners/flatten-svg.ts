import MessageBus from "../MessageBus/MessageBus";

type FlattenSVGData = {
    path: string,
    width: number,
    height: number,
    tolerance: number;
};

// Figma's exported path data always uses absolute commands, so splitting on M/m occurrences (each one
// starts a new subpath) yields self-contained strings that can each be parsed independently, with no
// "current point" carried over from a preceding subpath.
function splitIntoSubpaths(path: string): string[] {
    return path
        .split(/(?=[Mm])/)
        .map((subpath) => subpath.trim())
        .filter((subpath) => subpath.length > 0);
}

export default function flattenSVG(data: FlattenSVGData) {
    const { path, width, height, tolerance } = data;
    const SVG_NS = 'http://www.w3.org/2000/svg';

    // Create the SVG
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', `${width}`);
    svg.setAttribute('height', `${height}`);

    // A compound path (e.g. a ring: outer + inner boundary, or several disjoint fill regions
    // concatenated together — see clipPath.ts) has multiple M...Z subpaths within one string.
    // getTotalLength()/getPointAtLength() walk across all of them as one continuous "pen travel", so
    // sampling against the whole path would silently skip the zero-length jump between subpaths and
    // leave no indication of where one ends and the next begins. Flattening each subpath as its own
    // <path> element instead keeps them separate, so the caller can bridge them into a single boundary
    // deliberately (the "keyhole" technique) rather than get an unintended straight edge between them.
    const subpathPoints = splitIntoSubpaths(path).map((subpath) => {
        const pathElement = document.createElementNS(SVG_NS, 'path');
        pathElement.setAttribute('d', subpath);
        svg.appendChild(pathElement);

        const totalLength = pathElement.getTotalLength();
        const points: { x: number; y: number }[] = [];

        for (let length = 0; length <= totalLength; length += tolerance) {
            const point = pathElement.getPointAtLength(length);
            points.push({ x: point.x, y: point.y });
        }

        return points;
    });

    MessageBus.postMessage('flattened-svg-result', subpathPoints);
}
