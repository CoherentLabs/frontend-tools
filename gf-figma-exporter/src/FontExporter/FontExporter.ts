import { getAllFonts } from '@figma-plugin/helpers';
import fontsJSON from '../assets/fonts.json';
import { FontMapData, FontVariant, FontWeightData, GoogleFontMetadata, SubsetData } from './utils/typings';
import { TextSegment } from '../types/commonTypes';
import getSubsetFromCharacters from './utils/getSubsetFromCharacters';
import sanitizeFontName from './utils/sanitizeFontName';
import { getFontWidthSuffix, parseStyle } from './utils/parseStyleUtils';
import MessageBus from '../MessageBus/MessageBus';

const BACKUP_FONT_NAME = 'Noto Sans';
const BACKUP_FONT_ID = 'noto-sans';
const DROID_SANS = 'Droid Sans';

class FontExporter {

    page: FrameNode | null;
    usedFonts: FontName[];
    missingFonts: FontMapData;
    fontMap: FontMapData;
    googleFonts: FontMapData;
    googleFontsMetadata: GoogleFontMetadata;
    textSegments: TextSegment[];
    backupFonts: FontMapData;
    private fontVariantsCache = new Map<string, FontVariant[]>();

    constructor() {
        this.page = null;
        this.fontMap = {}; // What we'll use to generate the font list
        this.usedFonts = []; //All fonts used in the page
        this.googleFonts = {}; // Google fonts available in the page
        this.missingFonts = {}; // Missing fonts from Google Fonts, meaning that the user will have to upload them
        this.googleFontsMetadata = fontsJSON as GoogleFontMetadata; //All Google Fonts metadata - we'll change it later to fetch from an API
        this.textSegments = []; // All text segments in the page, we'll use them to get subsets and weights
        this.backupFonts = {}; // All fonts to be used as backup if a font is missing
    }

    async init(page: FrameNode): Promise<void> {
        this.page = page;
        const textNodes = this.page.findAll((node) => node.type === 'TEXT') as TextNode[];
        
        textNodes.forEach((node) => {
            const segments = (node as TextNode).getStyledTextSegments([
                'fontName',
                'fontWeight',
            ]) as unknown as TextSegment[];
            this.textSegments = [...this.textSegments, ...segments];
        });

        this.usedFonts = getAllFonts(textNodes) as unknown as FontName[];

        this.getMissingFonts(); // Set missing fonts that are not Google Fonts

        if (Object.keys(this.missingFonts).length > 0) {
            await this.waitForUserFonts();
        }

        await this.setAvailableFonts(); // Set Google Fonts available in the page
        await this.setBackupFonts(); // Set backup fonts (Noto Sans)

        // Combine all fonts into the final font map

        this.fontMap = Object.assign({}, this.googleFonts, this.missingFonts, this.backupFonts);
    }

    public clear(): void {
        this.page = null;
        this.fontMap = {};
        this.usedFonts = [];
        this.missingFonts = {};
        this.googleFonts = {};
        this.textSegments = [];
        this.backupFonts = {};
    }

    private async waitForUserFonts(): Promise<void> {
        return new Promise((resolve) => {
            MessageBus.postMessage('MISSING_FONTS_DETECTED', { fonts: this.missingFonts });
            figma.ui.resize(500, 700);
            MessageBus.on('MISSING_FONTS_RESPONSE', (data) => {
                this.missingFonts = (data as { fonts: FontMapData }).fonts;
                figma.ui.resize(500, 250);
                resolve();
            });
        });
    }

    private async setAvailableFonts(): Promise<void> {
        const fontPromises = this.usedFonts.map(async (font) => {
            if (this.isGoogleFont(font)) {
                const id = sanitizeFontName(font.family);
                const { width, italic } = parseStyle(font.style);
                const family = `${id}${getFontWidthSuffix(width)}`;

                const variants = this.getFontVariants(font);
                const styleKey = italic ? 'italic' : 'regular';

                this.ensureFontFamily(this.googleFonts, family);

                for (const variant of variants) {
                    this.ensureFontWeightStyle(this.googleFonts, family, variant.weight, styleKey);
                    this.googleFonts[family][variant.weight][styleKey].fontName = `${font.family}${width ? ` ${width}` : ''}`;

                    const subsetPromises = variant.subset.map(async (subset) => {
                        const fontData = await this.getFontData({
                            fontName: id,
                            italic,
                            weight: variant.weight,
                            subset,
                        });
                        const obj = {} as SubsetData;
                        obj[subset] = fontData || null;
                        return obj;
                    });

                    const subsets: SubsetData = {};
                    const results = await Promise.all(subsetPromises);
                    for (const subsetObj of results) {
                        Object.assign(subsets, subsetObj);
                    }

                    this.googleFonts[family][variant.weight][styleKey].subsets = subsets;
                }
            }
        });

        await Promise.all(fontPromises);
    }

    private isGoogleFont(fontName: FontName): boolean {
        const id = sanitizeFontName(fontName.family);
        const { width } = parseStyle(fontName.style);
        const key = `${id}${getFontWidthSuffix(width)}`;
        return Boolean(this.googleFontsMetadata[key]);
    }

    private getFontVariants(fontName: FontName): FontVariant[] {
        const key = `${fontName.family}-${fontName.style}`;
        if (this.fontVariantsCache.has(key)) {
            return this.fontVariantsCache.get(key)!;
        }

        const variants: FontVariant[] = [];
        this.textSegments.forEach((segment) => {
            if (segment.fontName.family === fontName.family && segment.fontName.style === fontName.style) {
                variants.push({
                    weight: segment.fontWeight,
                    subset: getSubsetFromCharacters(segment.characters),
                });
            }
        });

        this.fontVariantsCache.set(key, variants);
        return variants;
    }

    private async getFontData({
        fontName,
        italic,
        weight,
        subset,
    }: {
        fontName: string;
        italic: boolean;
        weight: number;
        subset: string;
    }): Promise<Uint8Array | null> {
        try {
            const fontData = this.googleFontsMetadata[fontName];
            if (!fontData) return null;

            const style = italic ? 'italic' : 'normal';

            if (!fontData.variants[weight] || !fontData.variants[weight][style]) return null;

            if (!fontData.variants[weight][style][subset]) return null;

            const response = await fetch(fontData.variants[weight][style][subset].url.truetype as string);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            return new Uint8Array(arrayBuffer);
        } catch (error) {
            console.warn(`Failed to fetch font ${fontName}:`, error);
            return null;
        }
    }

    private getMissingFonts(): void {
        this.usedFonts.forEach((font) => {
            if (this.isGoogleFont(font) || font.family.includes(DROID_SANS)) return;

            const id = sanitizeFontName(font.family);
            const { width, italic } = parseStyle(font.style);
            const family = `${id}${getFontWidthSuffix(width)}`;

            const variants = this.getFontVariants(font);
            const styleKey = italic ? 'italic' : 'regular';

            this.ensureFontFamily(this.missingFonts, family);

            for (const variant of variants) {
                if (!this.missingFonts[family][variant.weight]) {
                    this.missingFonts[family][variant.weight] = {};
                }

                if (!this.missingFonts[family][variant.weight][styleKey]) {
                    this.missingFonts[family][variant.weight][styleKey] = {
                        subsets: {},
                        fontName: `${font.family}${width ? ` ${width}` : ''}`,
                    };
                }

                for (const subset of variant.subset) {
                    this.missingFonts[family][variant.weight][styleKey].subsets[subset] = null;
                }
            }
        });
    }

    private async setBackupFonts(): Promise<void> {
        const usedFontsInPage = Object.assign({}, this.googleFonts, this.missingFonts);

        const backupFonts: FontWeightData = {};

        for (const [_fontFamily, weights] of Object.entries(usedFontsInPage)) {
            for (const [weight, styles] of Object.entries(weights)) {
            if (!backupFonts[weight]) backupFonts[weight] = {};
            for (const [style, fontData] of Object.entries(styles)) {
                if (!backupFonts[weight][style]) {
                backupFonts[weight][style] = {
                    subsets: {},
                    fontName: BACKUP_FONT_NAME,
                };
                }
                for (const subset of Object.keys(fontData.subsets)) {
                if (!backupFonts[weight][style].subsets[subset]) {
                    backupFonts[weight][style].subsets[subset] = await this.getFontData({
                    fontName: BACKUP_FONT_ID,
                    italic: style === 'italic',
                    weight: parseInt(weight, 10),
                    subset,
                    });
                }
                }
            }
            }
        }

        this.backupFonts = { [BACKUP_FONT_ID]: backupFonts };
    }

    private ensureFontFamily(fontMap: FontMapData, family: string): void {
        if (!fontMap[family]) {
            fontMap[family] = {};
        }
    }

    private ensureFontWeightStyle(fontMap: FontMapData, family: string, weight: number, style: string): void {
        this.ensureFontFamily(fontMap, family);
        if (!fontMap[family][weight]) {
            fontMap[family][weight] = {};
        }
        if (!fontMap[family][weight][style]) {
            fontMap[family][weight][style] = {
                subsets: {},
                fontName: '',
            };
        }
    }
}

export default new FontExporter();
