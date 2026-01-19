export default function getNestedLevel(node: BaseNode): number {
    let level = 0;
    let currentNode: BaseNode | null = node;
    while (currentNode) {
        level++;
        if (currentNode.parent && currentNode.parent.type === 'PAGE') break;
        currentNode = currentNode.parent;
    }
    return level;
}
