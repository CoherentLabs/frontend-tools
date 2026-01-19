import { PNG } from 'pngjs/browser';

export default async function convertLuminanceToAlpha(
    image: Uint8Array | null,
    width?: number,
    height?: number
): Promise<Uint8Array> {
    if (!image || !width || !height) {
        return Promise.reject('No image data provided');
    }

    const normalized = new Uint8Array(image);
    const png = await decodePng(normalized);
    const pixels = png.data;


    // Copy the input image data
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Calculate luminance using standard formula
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        // Set RGB to white and use luminance as alpha
        pixels[i] = 255; // R
        pixels[i + 1] = 255; // G
        pixels[i + 2] = 255; // B
        pixels[i + 3] = Math.round(luminance); // A
    }

    const imgData: Uint8Array[] = [];

    return new Promise((resolve) => {
    png.pack()
        .on('data', (chunk: Uint8Array) => imgData.push(chunk))
        .on('end', () => {
            const totalLength = imgData.reduce((sum, c) => sum + c.length, 0);
            const out = new Uint8Array(totalLength);
            let offset = 0;
            for (const c of imgData) {
                out.set(c, offset);
                offset += c.length;
            }
            resolve(out);
        });
    });

}

function decodePng(bytes: Uint8Array): Promise<PNG> {
    return new Promise((resolve, reject) => {
        const png = new PNG();

        //@ts-expect-error typings are for the nodejs version
        png.parse(bytes, (err, data) => {
            if (err) reject(err);
            else resolve(data); // `data` is the same PNG instance
        });
    });
}
