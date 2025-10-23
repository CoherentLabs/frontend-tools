export type GFImage = { name: string; data: Uint8Array | null };

export type PrimitiveNodes = FrameNode | RectangleNode | EllipseNode | GroupNode;

export type NodesWithFillsAndStrokes = FrameNode | RectangleNode | EllipseNode;

type SharedKeys<T, U> = keyof T & keyof U;
type SharedProps<T, U> = Pick<T, SharedKeys<T, U>>;

export type FrameAndGroup = SharedProps<FrameNode, GroupNode>;