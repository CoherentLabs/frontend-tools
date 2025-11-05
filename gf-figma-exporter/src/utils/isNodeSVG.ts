export default function isNodeSVG(node: SceneNode): boolean {
    if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION' || node.type === 'STAR' || node.type === 'LINE' || node.type === 'POLYGON') return true;

    if (node.type === 'ELLIPSE' && node.arcData && isEllipseFullCircle(node)) return true;

    return false;
}

function isEllipseFullCircle(node: EllipseNode): boolean {
    return node.arcData.startingAngle === 0 && node.arcData.endingAngle === 2 * Math.PI && node.arcData.innerRadius === 0;
}