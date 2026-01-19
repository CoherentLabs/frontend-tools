export default function countAllDescendants(nodes: readonly (BaseNode & ChildrenMixin)[]): number {
    let total = 0;
    for (const node of nodes) {
        total += countDescendants(node);
    }
    return total;
}

function countDescendants(node: BaseNode & ChildrenMixin): number {
    let total = node.children.length;
    for (const child of node.children) {
        if ('children' in child) {
            total += countDescendants(child);
        }
    }
    return total;
}
