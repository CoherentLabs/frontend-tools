import MessageBus from "../MessageBus/MessageBus";

type PathBBoxData = {
    path: string;
};

export default function PathBBox(data: PathBBoxData) {
    const { path } = data;
    const SVG_NS = 'http://www.w3.org/2000/svg';

    // Create the SVG
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.style.position = 'absolute';
    svg.style.left = '-9999px';

    document.body.appendChild(svg);

    // Create a path
    const pathElement = document.createElementNS(SVG_NS, 'path');
    pathElement.setAttribute('d', path);

    svg.appendChild(pathElement);

    const bbox = pathElement.getBBox();

    document.body.removeChild(svg);

    MessageBus.postMessage('path-bbox-result', {
        x: Number(bbox.x),
        y: Number(bbox.y),
        width: Number(bbox.width),
        height: Number(bbox.height),
    });
}
