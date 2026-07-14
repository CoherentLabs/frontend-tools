
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

// Two different origins produce two different runtime shapes here — see the matching comment in
// src/FontExporter/utils/typings.ts. A server-fetched font stays a base64 string until it's decoded at
// the point of use (addFontsToZip below); a user-uploaded font is already a real Uint8Array.
export type SubsetData = {
  [subset: string]: string | Uint8Array | null;
}

export interface GFFont extends FontMapData {}

