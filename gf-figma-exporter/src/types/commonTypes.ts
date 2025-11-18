import { FontMapData } from './../FontExporter/utils/typings';
export type GFImage = { name: string; data: Uint8Array | null };

export type PrimitiveNodes = FrameNode | RectangleNode | EllipseNode | GroupNode;

export type NodesWithFillsAndStrokes = FrameNode | RectangleNode | EllipseNode;

type SharedKeys<T, U> = keyof T & keyof U;
type SharedProps<T, U> = Pick<T, SharedKeys<T, U>>;

export type FrameAndGroup = SharedProps<FrameNode, GroupNode>;

export type SVGNodes = VectorNode | LineNode | StarNode | PolygonNode | EllipseNode;


export interface TextSegment {
    characters: string;
    fillStyleId: string | null;
    fills: Paint[];
    fontSize: number;
    fontName: FontName;
    letterSpacing: LetterSpacing;
    lineHeight: LineHeight;
    textCase: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
    textDecoration: TextDecoration;
    textDecorationStyle: TextDecorationStyle;
    textDecorationColor: TextDecorationColor;
    textDecorationThickness: TextDecorationThickness;
    textDecorationOffset: TextDecorationOffset;
    fontWeight: number;
    textStyleId: string | null;
}

export interface GFFont extends FontMapData {}

