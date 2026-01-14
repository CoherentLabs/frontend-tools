import { AvailableNode } from "../../types/commonTypes";
import { getRelativeCssTransform } from "../../utils/transformUtils";

export function generateTransformStyle(node: AvailableNode): string {
    let transform = '';

    const { rotation, scaleX, scaleY } = getRelativeCssTransform(node, node.parent as AvailableNode);

    transform += `rotate(${rotation}deg) `;
    transform += `scale(${scaleY}, ${scaleX})`;

    return transform.trim();
}

