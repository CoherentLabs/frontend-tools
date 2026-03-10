import JSZip from 'jszip';
import { GFFont } from '../commonTypes';
import MessageBus from '../MessageBus/MessageBus';
import { base64toUint8Array, isBase64 } from '../utils/base64toUint8Array';

type ExporterResult = {
    [pageName: string]: {
        html: string;
        css: string;
        images: Array<{ name: string; data: Uint8Array | null }>;
        fonts?: GFFont;
    };
};

export default function downloadPages(data: { pages: ExporterResult; filename: string }) {
    const pages = data.pages;

    const jszip = new JSZip();
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
            for (const [font, fontWeights] of Object.entries(fonts)) {
                for (const [weight, weightStyles] of Object.entries(fontWeights)) {
                    for (const [style, styleData] of Object.entries(weightStyles)) {
                        for (const [subset, data] of Object.entries(styleData.subsets)) {
                            if (data) {
                                if (isBase64(data)) {
                                    const fontData = base64toUint8Array(data as string);
                                    jszip.file(`${name}/fonts/${font}-${style}_${weight}_${subset}.ttf`, fontData);
                                    continue;
                                }
                                
                                jszip.file(`${name}/fonts/${font}-${style}_${weight}_${subset}.ttf`, data);
                            }
                        }
                    }
                }
            }
        }
    }

    jszip.generateAsync({ type: 'blob' }).then((archive) => {
        const archiveUrl = URL.createObjectURL(archive);

        // Create download links and trigger the downloads
        const aZip = document.createElement('a');
        aZip.href = archiveUrl;
        aZip.download = data.filename; // Default download filename for ZIP
        aZip.click();
        URL.revokeObjectURL(archiveUrl); // Clean up the URL object

        MessageBus.postMessage('close-plugin', {});
    }).catch((error) => {
        console.error('Error generating ZIP archive:', error);
    });
}
