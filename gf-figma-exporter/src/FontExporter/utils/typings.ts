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

export type SubsetData = {
  [subset: string]: Uint8Array | null;
}