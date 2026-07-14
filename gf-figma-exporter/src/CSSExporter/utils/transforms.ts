import { AvailableNode } from "../../types/commonTypes";
import { getRelativeCssTransform } from "../../utils/transformUtils";

export function generateTransformStyle(node: AvailableNode): string {
    let transform = '';

    const { rotation, scaleX, scaleY } = getRelativeCssTransform(node, node.parent as AvailableNode);

    transform += `rotate(${rotation.toFixed(2)}deg) `;
    transform += `scale(${scaleY.toFixed(2)}, ${scaleX.toFixed(2)})`;

    return transform.trim();
}

