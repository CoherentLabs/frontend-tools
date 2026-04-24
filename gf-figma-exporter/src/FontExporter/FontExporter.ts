import { getAllFonts } from '@figma-plugin/helpers';
import { FontMapData } from './utils/typings';
import { TextSegment } from '../types/commonTypes';
import MessageBus from '../MessageBus/MessageBus';
import fetchDataFromFontServer from '../utils/fetchDataFromFontServer';

class FontExporter {
    page: FrameNode | null;
    usedFonts: FontName[];
    missingFonts: FontMapData;
    fontMap: FontMapData;
    googleFonts: FontMapData;
    textSegments: TextSegment[];
    backupFonts: FontMapData;
    userFonts: FontMapData;

    constructor() {
        this.page = null;
        this.fontMap = {}; // What we'll use to generate the font list
        this.usedFonts = []; //All fonts used in the page
        this.googleFonts = {}; // Google fonts available in the page
        this.missingFonts = {}; // Missing fonts from Google Fonts, meaning that the user will have to upload them
        this.textSegments = []; // All text segments in the page, we'll use them to get subsets and weights
        this.backupFonts = {}; // All fonts to be used as backup if a font is missing
        this.userFonts = {}; // Fonts uploaded by the user
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

        try {
            this.missingFonts = (await fetchDataFromFontServer('get-missing-fonts', {
                textSegments: this.textSegments,
                usedFonts: this.usedFonts,
            })) as FontMapData;
        } catch (error) {
            MessageBus.postMessage('ERROR', { message: 'Failed to fetch missing fonts from the font server.' });
            console.error('Failed to fetch missing fonts from the font server:', error);
            return;
        }

        if (Object.keys(this.missingFonts).length > 0) {
            await this.waitForUserFonts();
        }

        try {
            this.googleFonts = (await fetchDataFromFontServer('set-available-fonts', {
                textSegments: this.textSegments,
                usedFonts: this.usedFonts,
            })) as FontMapData;
        } catch (error) {
            MessageBus.postMessage('ERROR', { message: 'Failed to fetch missing fonts from the font server.' });
            console.error('Failed to fetch missing fonts from the font server:', error);
            return;
        }

        const usedFontsInPage = this.clearFontData();
        try {
            this.backupFonts = (await fetchDataFromFontServer('set-backup-fonts', {
                usedFontsInPage,
            })) as FontMapData;
            console.log('Backup fonts fetched successfully:', this.backupFonts);
        } catch (error) {
            MessageBus.postMessage('ERROR', { message: 'Failed to fetch backup fonts from the font server.' });
            console.error('Failed to fetch backup fonts from the font server:', error);
            return;
        }

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
                figma.ui.resize(500, 275);
                resolve();
            });
        });
    }

    private clearFontData(): FontMapData {
        const usedFontsInPage = Object.assign(
            {},
            JSON.parse(JSON.stringify(this.googleFonts)),
            JSON.parse(JSON.stringify(this.missingFonts))
        );

        for (const [fontKey, fontWeights] of Object.entries(usedFontsInPage as FontMapData)) {
            for (const [weightKey, weightStyles] of Object.entries(fontWeights)) {
                for (const [styleKey, styleData] of Object.entries(weightStyles)) {
                    for (const subsetKey of Object.keys(styleData.subsets)) {
                        usedFontsInPage[fontKey][weightKey][styleKey].subsets[subsetKey] = null;
                    }
                }
            }
        }

        return usedFontsInPage;
    }
}

export default new FontExporter();