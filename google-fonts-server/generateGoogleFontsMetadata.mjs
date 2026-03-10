/* eslint-disable no-undef */
import { APIv2 } from "google-font-metadata";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateGoogleFontsMetadata() {
    const metadata = {};

    for (const fontName of Object.keys(APIv2)) {
        const font = APIv2[fontName];
        metadata[fontName] = {
            family: font.family,
            subsets: font.subsets,
            variants: font.variants,
            category: font.category,
        };
    }

    await fs.writeFile(path.join(__dirname, "./fonts.json"), JSON.stringify(metadata, null, 2));
}


 generateGoogleFontsMetadata().catch((error) => {
    console.error("Error generating Google Fonts metadata:", error);
    process.exit(1);
});
