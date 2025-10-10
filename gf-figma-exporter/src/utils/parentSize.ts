export default function getParentSize(node: BaseNode | null): { width: number; height: number } {
    
    if (!node || node.type === 'DOCUMENT' || node.type === 'PAGE') {
        return { width: 0, height: 0 };
    }

    if (node && 'width' in node && 'height' in node) {
        return { width: node.width, height: node.height };
    }

    return { width: 0, height: 0 };
}