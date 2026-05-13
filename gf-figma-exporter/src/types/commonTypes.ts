import { FontMapData } from './../FontExporter/utils/typings';
export type GFImage = { name: string; data: Uint8Array | null };

export type ExportMode = 'page' | 'component';

export type ComponentExportEntry = {
    html: string;
    css: string;
    images: GFImage[];
};

export type ComponentExportResult = {
    components: { [name: string]: ComponentExportEntry };
    fontsCss: string;
    fonts: GFFont;
};

export type PrimitiveNodes = FrameNode | RectangleNode | EllipseNode | GroupNode;

export type NodesWithFillsAndStrokes = FrameNode | RectangleNode | EllipseNode;

type SharedKeys<T, U> = keyof T & keyof U;
type SharedProps<T, U> = Pick<T, SharedKeys<T, U>>;

export type FrameAndGroup = SharedProps<FrameNode, GroupNode>;

export type SVGNodes = VectorNode | LineNode | StarNode | PolygonNode | EllipseNode;

type NodesNotExported = SliceNode | ComponentSetNode | ComponentNode | StickyNode | ConnectorNode | ShapeWithTextNode | CodeBlockNode | WidgetNode | EmbedNode | LinkUnfurlNode | TableNode | TableCellNode | MediaNode | SectionNode | SlideRowNode | SlideGridNode | InteractiveSlideElementNode | DocumentNode  | PageNode;

export type AvailableNode = Exclude<SceneNode, NodesNotExported>;

export type ExportableNodes = AvailableNode | MaskNode;

export type MaskNode = {
    type: 'MASK';
    id: string;
    name: string;
    maskChildren: ExportableNodes[];
    originalNode: ExportableNodes;
    isMask: true;
    maskType?: AvailableNode['maskType'];
    visible: boolean;
    width?: AvailableNode['width'];
    height?: AvailableNode['height'];
}

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

export interface FlexContainerStyles {
    direction: string;
    justifyContent: string;
    alignItems: string;
    alignContent: string;
    wrap: string;
}

export interface FlexItemStyles {
    flex: string;
    alignSelf: string;
    gap: string;
}

export interface Paddings {
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
}