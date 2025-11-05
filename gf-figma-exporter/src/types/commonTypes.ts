export type GFImage = { name: string; data: Uint8Array | null };

export type PrimitiveNodes = FrameNode | RectangleNode | EllipseNode | GroupNode;

export type NodesWithFillsAndStrokes = FrameNode | RectangleNode | EllipseNode;

type SharedKeys<T, U> = keyof T & keyof U;
type SharedProps<T, U> = Pick<T, SharedKeys<T, U>>;

export type FrameAndGroup = SharedProps<FrameNode, GroupNode>;

export type SVGNodes = VectorNode | LineNode | StarNode | PolygonNode | EllipseNode;

export interface Point {
    x: number;
    y: number;
}

export interface FlattenOptions {
    /** Max allowed deviation (in px) between the curve and its polyline approximation. */
    tolerancePx?: number;
    /** Coarse chunk count before adaptive refinement (higher = more initial samples). */
    initialChunkCount?: number;
}