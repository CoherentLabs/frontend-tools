import JSZip from 'jszip';
import { ComponentExportResult, ExportMode, GFFont } from '../commonTypes';
import MessageBus from '../MessageBus/MessageBus';
import { base64toUint8Array } from '../utils/base64toUint8Array';

type PageExporterResult = {
    [pageName: string]: {
        html: string;
        css: string;
        images: Array<{ name: string; data: Uint8Array | null }>;
        fonts?: GFFont;
    };
};

function addFontsToZip(jszip: JSZip, fonts: GFFont, folder: string): void {
    for (const [font, fontWeights] of Object.entries(fonts)) {
        for (const [weight, weightStyles] of Object.entries(fontWeights)) {
            for (const [style, styleData] of Object.entries(weightStyles)) {
                for (const [subset, data] of Object.entries(styleData.subsets)) {
                    if (data) {
                        // Font-server data arrives as a base64 string (see SubsetData in commonTypes.ts)
                        // and must be decoded to real bytes before JSZip writes it out — otherwise it
                        // writes the base64 text itself as the .ttf's contents. A user-uploaded font is
                        // already a real Uint8Array and needs no conversion.
                        const fontBytes = typeof data === 'string' ? base64toUint8Array(data) : data;
                        jszip.file(`${folder}${font}-${style}_${weight}_${subset}.ttf`, fontBytes);
                    }
                }
            }
        }
    }
}

function packagePageMode(jszip: JSZip, pages: PageExporterResult): void {
    for (const [name, { html, css, images, fonts }] of Object.entries(pages)) {
        jszip.file(`${name}/${name}.html`, html);
        jszip.file(`${name}/${name}.css`, css);

        if (images.length > 0) {
            for (const image of images) {
                if (image.data) {
                    jszip.file(`${name}/${image.name}`, image.data);
                }
            }
        }

        if (fonts && Object.keys(fonts).length > 0) {
            addFontsToZip(jszip, fonts, `${name}/fonts/`);
        }
    }
}

function packageComponentMode(jszip: JSZip, result: ComponentExportResult): void {
    if (result.fontsCss) {
        jszip.file('fonts.css', result.fontsCss);
    }

    if (result.fonts && Object.keys(result.fonts).length > 0) {
        addFontsToZip(jszip, result.fonts, 'fonts/');
    }

    for (const [name, { html, css, images }] of Object.entries(result.components)) {
        jszip.file(`components/${name}/${name}.html`, html);
        jszip.file(`components/${name}/${name}.css`, css);

        for (const image of images) {
            if (image.data) {
                jszip.file(`components/${name}/${image.name}`, image.data);
            }
        }
    }
}

export default function downloadPages(data: { mode?: ExportMode; payload: PageExporterResult | ComponentExportResult; filename: string }) {
    const jszip = new JSZip();

    if (data.mode === 'component') {
        packageComponentMode(jszip, data.payload as ComponentExportResult);
    } else {
        packagePageMode(jszip, data.payload as PageExporterResult);
    }

    jszip.generateAsync({ type: 'blob' }).then((archive) => {
        const archiveUrl = URL.createObjectURL(archive);

        const aZip = document.createElement('a');
        aZip.href = archiveUrl;
        aZip.download = data.filename;
        aZip.click();
        URL.revokeObjectURL(archiveUrl);

        MessageBus.postMessage('close-plugin', {});
    });
}
