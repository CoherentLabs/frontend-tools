import { NodesWithFillsAndStrokes, PrimitiveNodes } from '../../types/commonTypes';

export function hideStrokes(node: NodesWithFillsAndStrokes) {
    if (!node.strokes || node.strokes.length === 0) return;

    node.strokes = [];
}


export function restoreStrokes(node: NodesWithFillsAndStrokes, originalStrokes: Paint[] | ReadonlyArray<Paint>) {
    if (!originalStrokes || originalStrokes.length === 0) return;

    node.strokes = originalStrokes;
}

export function hideFills(node: NodesWithFillsAndStrokes) {
    if (!node.fills || node.fills === figma.mixed || node.fills.length === 0) return;

    node.fills = [];
}

export function restoreFills(node: NodesWithFillsAndStrokes, originalFills: Paint[] | ReadonlyArray<Paint> | PluginAPI['mixed']) {
    if (!originalFills || originalFills === figma.mixed || originalFills.length === 0) return;

    node.fills = originalFills;
}

export function hideEffects(node: PrimitiveNodes) {
    if (!node.effects || node.effects.length === 0) return;

    node.effects = [];
}

export function restoreEffects(node: PrimitiveNodes, originalEffects: Effect[] | ReadonlyArray<Effect>) {
    if (!originalEffects || originalEffects.length === 0) return;

    node.effects = originalEffects;
}