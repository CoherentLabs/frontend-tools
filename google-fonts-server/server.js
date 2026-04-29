const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getFontWidthSuffix, sanitizeFontName, parseStyle, getSubsetFromCharacters } = require('./utils');

const app = express();
const PORT = 54322;

const fetch = require('cross-fetch');

const DROID_SANS = 'Droid Sans';
const BACKUP_FONT_NAME = 'Noto Sans';
const BACKUP_FONT_ID = 'noto-sans';

// Middleware
app.use(cors()); // Allows fetch calls from other domains
app.use(express.json()); // Allows us to parse JSON bodies sent via fetch

// 1. Load the Google Fonts JSON into memory on server start
// We use readFileSync because we want this data available before the server starts accepting requests
const fontsFilePath = path.join(__dirname, 'fonts.json');
let googleFontsData = {};

try {
    const rawData = fs.readFileSync(fontsFilePath, 'utf8');
    const parsedData = JSON.parse(rawData);
    // Google fonts JSON usually keeps the array inside an "items" key
    googleFontsData = parsedData || {};
} catch (error) {
    console.error('❌ Error loading fonts.json:', error.message);
}

// 2. The Filter Endpoint
// We use POST because we are sending a list of fonts to be processed
app.post('/api/get-missing-fonts', (req, res) => {
    const { textSegments, usedFonts } = req.body;
    let missingFonts = {};
    usedFonts.forEach((font) => {
        if (isGoogleFont(font) || font.family.includes(DROID_SANS)) return;

        const id = sanitizeFontName(font.family);
        const { width, italic } = parseStyle(font.style);
        const family = `${id}${getFontWidthSuffix(width)}`;

        const variants = getFontVariants(font, textSegments);
        const styleKey = italic ? 'italic' : 'regular';

        ensureFontFamily(missingFonts, family);

        for (const variant of variants) {
            if (!missingFonts[family][variant.weight]) {
                missingFonts[family][variant.weight] = {};
            }

            if (!missingFonts[family][variant.weight][styleKey]) {
                missingFonts[family][variant.weight][styleKey] = {
                    subsets: {},
                    fontName: `${font.family}${width ? ` ${width}` : ''}`,
                };
            }

            for (const subset of variant.subset) {
                missingFonts[family][variant.weight][styleKey].subsets[subset] = null;
            }
        }
    });

    res.json(missingFonts);
});

app.post('/api/set-available-fonts', async (req, res) => {
    const { usedFonts, textSegments } = req.body;
    let googleFonts = {};
    const fontPromises = usedFonts.map(async (font) => {
        if (isGoogleFont(font)) {
            const id = sanitizeFontName(font.family);
            const { width, italic } = parseStyle(font.style);
            const family = `${id}${getFontWidthSuffix(width)}`;

            const variants = getFontVariants(font, textSegments);
            const styleKey = italic ? 'italic' : 'regular';

            ensureFontFamily(googleFontsData, family);

            for (const variant of variants) {
                ensureFontWeightStyle(googleFonts, family, variant.weight, styleKey);
                googleFonts[family][variant.weight][styleKey].fontName = `${font.family}${width ? ` ${width}` : ''}`;

                const subsetPromises = variant.subset.map(async (subset) => {
                    const fontData = await getFontData({
                        fontName: id,
                        italic,
                        weight: variant.weight,
                        subset,
                    });
                    const obj = {};
                    obj[subset] = fontData || null;
                    return obj;
                });

                const subsets = {};
                const results = await Promise.all(subsetPromises);
                for (const subsetObj of results) {
                    Object.assign(subsets, subsetObj);
                }

                googleFonts[family][variant.weight][styleKey].subsets = subsets;
            }
        }
    });

    await Promise.all(fontPromises);

    res.json(googleFonts);
});

app.post('/api/set-backup-fonts', async (req, res) => {
    const { usedFontsInPage } = req.body;

    let allBackupFonts = {};
    let backupFonts = {};

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
                        backupFonts[weight][style].subsets[subset] = await getFontData({
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

    allBackupFonts = { [BACKUP_FONT_ID]: backupFonts };
    res.json(allBackupFonts);
});

async function getFontData({ fontName, italic, weight, subset }) {
    try {
        const fontData = googleFontsData[fontName];
        if (!fontData) return null;

        const style = italic ? 'italic' : 'normal';

        if (!fontData.variants[weight] || !fontData.variants[weight][style]) return null;

        if (!fontData.variants[weight][style][subset]) return null;

        const response = await fetch(fontData.variants[weight][style][subset].url.truetype);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
    } catch (error) {
        console.warn(`Failed to fetch font ${fontName}:`, error);
        return null;
    }
}

function isGoogleFont(fontName) {
    const id = sanitizeFontName(fontName.family);
    const { width } = parseStyle(fontName.style);
    const key = `${id}${getFontWidthSuffix(width)}`;
    return Boolean(googleFontsData[key]);
}

function getFontVariants(fontName, textSegments) {
    const key = `${fontName.family}-${fontName.style}`;

    const variants = [];
    textSegments.forEach((segment) => {
        if (segment.fontName.family === fontName.family && segment.fontName.style === fontName.style) {
            variants.push({
                weight: segment.fontWeight,
                subset: getSubsetFromCharacters(segment.characters),
            });
        }
    });
    return variants;
}

function ensureFontFamily(fontMap, family) {
    if (!fontMap[family]) {
        fontMap[family] = {};
    }
}

function ensureFontWeightStyle(fontMap, family, weight, style) {
    ensureFontFamily(fontMap, family);
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

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
