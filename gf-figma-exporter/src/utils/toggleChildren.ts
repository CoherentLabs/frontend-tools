export default function toggleChildren(node: FrameNode | GroupNode | InstanceNode, visible: boolean) {
    node.children.forEach((child) => {
        if (child.visible !== visible) {
            child.visible = visible;
        }
    });
}
