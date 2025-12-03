export function generateTransformStyle(node: SceneNode): string {
    let transform = '';

    const rotation = getRotation(node);
    if (rotation !== null) {
        transform += ` rotate(${rotation}deg)`;
    }

    return transform.trim();
}

function getRotation(node: SceneNode): number | null {
    if ('rotation' in node === false) {
        return null;
    }

    if (!node.rotation || node.rotation === 0) {
        return null;
    }

    return node.rotation * -1; // Invert rotation for CSS
}