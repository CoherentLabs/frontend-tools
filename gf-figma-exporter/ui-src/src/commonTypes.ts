
export type GFImage = { name: string; data: Uint8Array | null };

export type ExportMode = 'page' | 'component';

export type ComponentExportEntry = {
    html: string;
    css: string;
    images: Array<{ name: string; data: Uint8Array | null }>;
};

export type ComponentExportResult = {
    components: { [name: string]: ComponentExportEntry };
    fontsCss: string;
    fonts: GFFont;
};

export interface FontMapData {
  [fontFamily: string]: FontWeightData;
}

export interface FontWeightData {
  [weight: number | string]: FontStyleData;
}

export type FontStyleData = {
  [style: string]: FontMapEntryData;
};

export type FontMapEntryData = {
  subsets: SubsetData;
  fontName: string;
}

export type SubsetData = {
  [subset: string]: Uint8Array | null;
}

export interface GFFont extends FontMapData {}

