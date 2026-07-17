export interface GoogleFontMetadata {
  [fontId: string]: GoogleFontFamily;
}

export interface GoogleFontFamily {
  family: string;
  subsets: string[];
  variants: WeightVariants;
  category: string;
}

interface FontUrl {
  woff2?: string;
  woff?: string;
  truetype?: string;
}

interface SubsetVariant {
  url: FontUrl;
}

interface StyleVariants {
  italic?: Record<string, SubsetVariant>;
  normal?: Record<string, SubsetVariant>;
}

interface WeightVariants {
  [weight: string]: StyleVariants;
}

export interface FontVariant {
  weight: number;
  subset: string[];
}

export type FontWidth = 'Condensed' | 'Expanded';

export interface ParsedStyle {
    italic: boolean;
    width: FontWidth | null;
}

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

// Two different origins produce two different runtime shapes here: a font fetched from the font server
// (google-fonts-server's getFontData does Buffer.from(arrayBuffer).toString('base64')) stays a base64
// string all the way through the plugin sandbox and is only decoded to real bytes at the point of use
// (ui-src/src/listeners/download-pages.ts's addFontsToZip). A user-uploaded font (App.tsx's
// readFilesAsArrayBuffer, new Uint8Array(arrayBuffer)) is already real bytes by the time it reaches this
// map, and survives the postMessage round-trip as an actual Uint8Array (structured clone, not JSON).
export type SubsetData = {
  [subset: string]: string | Uint8Array | null;
}