import { NodesWithFills } from '../types/commonTypes';
import hasImage from './hasImage';

function hasFill(fills: readonly Paint[] | PluginAPI['mixed'], type: string): boolean {
    return (fills as Paint[]).some((fill) => fill.type === type);
}

export default function checkIfPseudoIsRequired(node: NodesWithFills): boolean {
    // Check if the node has an Image, a Radial Gradient, or a Diamond Gradient fill
    const hasSpecialFill =
        node.fills &&
        node.fills !== figma.mixed &&
        node.fills.length > 0 &&
        (hasImage(node.fills) || hasFill(node.fills, 'GRADIENT_RADIAL') || hasFill(node.fills, 'GRADIENT_DIAMOND'));

    // Check if the node has any strokes. We need to add a pseudo-element for strokes, because if we set them as borders on the main element, it will appear bellow the pseudo-element for special fills
    const hasStroke = node.strokes && node.strokes.length > 0;

    // If the node has a fill or a stroke, it may require a pseudo-element
    return hasSpecialFill || hasStroke;
}
