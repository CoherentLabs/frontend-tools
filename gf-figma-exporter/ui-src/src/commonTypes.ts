
export type GFImage = { name: string; data: Uint8Array | null };

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
  [subset: string]: Uint8Array | null | string;
}

export interface GFFont extends FontMapData {}

