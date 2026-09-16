import { createHash } from 'node:crypto';
import sharp from 'sharp';
import type { Insets } from './contract.js';

export interface RawImage {
    data: Buffer;
    width: number;
    height: number;
    /** Always 4 - every capture is decoded to straight RGBA. */
    channels: number;
}

export async function decode(png: Buffer): Promise<RawImage> {
    const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height, channels: 4 };
}

/**
 * Converts a capture from premultiplied to straight alpha, in place.
 *
 * The Player's `Page.captureScreenshot` hands back premultiplied RGBA, but a PNG is straight
 * alpha by definition, and cohtml premultiplies again when it uploads the texture. Saving the
 * capture as-is therefore multiplies every partially transparent pixel by its alpha twice,
 * which is invisible in the file and unmistakable on screen: soft shadows come out too dark
 * and desaturated against the backdrop. Measured against live CSS over an opaque backdrop, a
 * shadow pixel at alpha 0.096 landed on 89 instead of 109 before this ran.
 */
export function unpremultiply(image: RawImage): RawImage {
    const { data } = image;

    for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha === 0 || alpha === 255) continue;

        data[i] = Math.min(255, Math.round((data[i] * 255) / alpha));
        data[i + 1] = Math.min(255, Math.round((data[i + 1] * 255) / alpha));
        data[i + 2] = Math.min(255, Math.round((data[i + 2] * 255) / alpha));
    }

    return image;
}

export async function encodePng(image: RawImage): Promise<Buffer> {
    return sharp(image.data, { raw: { width: image.width, height: image.height, channels: 4 } })
        .png({ compressionLevel: 9 })
        .toBuffer();
}

export async function encodeWebp(image: RawImage): Promise<Buffer> {
    return sharp(image.data, { raw: { width: image.width, height: image.height, channels: 4 } })
        .webp({ lossless: true })
        .toBuffer();
}

export interface TrimResult {
    image: RawImage;
    /** How many fully transparent pixels were removed from each side. */
    removed: Insets;
}

/**
 * Cuts away fully transparent margins.
 *
 * The ink-overflow formula in the planner only has to be generous enough that nothing is
 * clipped; this trim is what actually establishes how far the decoration reaches, which is
 * why the manifest records the trimmed values rather than the predicted ones.
 */
export function trimTransparent(image: RawImage): TrimResult {
    const { data, width, height } = image;

    let top = 0;
    let bottom = height - 1;
    let left = 0;
    let right = width - 1;

    const rowHasInk = (y: number) => {
        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] !== 0) return true;
        }
        return false;
    };

    const columnHasInk = (x: number) => {
        for (let y = 0; y < height; y++) {
            if (data[(y * width + x) * 4 + 3] !== 0) return true;
        }
        return false;
    };

    while (top < height && !rowHasInk(top)) top++;

    // Everything was transparent - hand back a 1x1 so callers have something valid to report.
    if (top === height) {
        return {
            image: { data: Buffer.alloc(4), width: 1, height: 1, channels: 4 },
            removed: { top: 0, right: 0, bottom: 0, left: 0 },
        };
    }

    while (bottom > top && !rowHasInk(bottom)) bottom--;
    while (left < width && !columnHasInk(left)) left++;
    while (right > left && !columnHasInk(right)) right--;

    return {
        image: crop(image, left, top, right - left + 1, bottom - top + 1),
        removed: { top, right: width - 1 - right, bottom: height - 1 - bottom, left },
    };
}

export function crop(image: RawImage, x: number, y: number, w: number, h: number): RawImage {
    const out = Buffer.alloc(w * h * 4);

    for (let row = 0; row < h; row++) {
        const source = ((y + row) * image.width + x) * 4;
        image.data.copy(out, row * w * 4, source, source + w * 4);
    }

    return { data: out, width: w, height: h, channels: 4 };
}

export interface UniformityReport {
    ok: boolean;
    /** Largest per-channel deviation found along a stretch axis, in 0-255 units. */
    worst: number;
    where: string;
}

/** Anything above this in a stretch zone would visibly band once the strip is stretched. */
const UNIFORMITY_TOLERANCE = 2;

/**
 * Checks that every stretched region of a 9-slice really is uniform along the axis it will
 * be stretched on. A diagonal gradient looks fine in the capture and falls apart the moment
 * border-image stretches it, so this is a build error rather than a warning.
 */
export function validateStretchZones(image: RawImage, insets: Insets): UniformityReport {
    const { width, height } = image;

    const innerWidth = width - insets.left - insets.right;
    const innerHeight = height - insets.top - insets.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) {
        return { ok: false, worst: 255, where: 'the corner insets leave no stretch zone at all' };
    }

    let worst = 0;
    let where = '';

    const track = (deviation: number, label: string) => {
        if (deviation > worst) {
            worst = deviation;
            where = label;
        }
    };

    // Horizontal edges stretch along x: every row in them must be constant across x.
    for (const [label, y0, y1] of [
        ['top edge', 0, insets.top],
        ['bottom edge', height - insets.bottom, height],
    ] as const) {
        for (let y = y0; y < y1; y++) {
            track(rowDeviation(image, y, insets.left, width - insets.right), `${label} (row ${y})`);
        }
    }

    // Vertical edges stretch along y: every column must be constant down y.
    for (const [label, x0, x1] of [
        ['left edge', 0, insets.left],
        ['right edge', width - insets.right, width],
    ] as const) {
        for (let x = x0; x < x1; x++) {
            track(columnDeviation(image, x, insets.top, height - insets.bottom), `${label} (column ${x})`);
        }
    }

    // The centre is stretched on both axes, so it has to be uniform in both.
    for (let y = insets.top; y < height - insets.bottom; y++) {
        track(rowDeviation(image, y, insets.left, width - insets.right), `centre (row ${y})`);
    }
    for (let x = insets.left; x < width - insets.right; x++) {
        track(columnDeviation(image, x, insets.top, height - insets.bottom), `centre (column ${x})`);
    }

    return { ok: worst <= UNIFORMITY_TOLERANCE, worst, where };
}

function rowDeviation(image: RawImage, y: number, x0: number, x1: number): number {
    if (x1 - x0 <= 1) return 0;

    const base = (y * image.width + x0) * 4;
    let worst = 0;

    for (let x = x0 + 1; x < x1; x++) {
        const at = (y * image.width + x) * 4;
        for (let c = 0; c < 4; c++) worst = Math.max(worst, Math.abs(image.data[at + c] - image.data[base + c]));
    }

    return worst;
}

function columnDeviation(image: RawImage, x: number, y0: number, y1: number): number {
    if (y1 - y0 <= 1) return 0;

    const base = (y0 * image.width + x) * 4;
    let worst = 0;

    for (let y = y0 + 1; y < y1; y++) {
        const at = (y * image.width + x) * 4;
        for (let c = 0; c < 4; c++) worst = Math.max(worst, Math.abs(image.data[at + c] - image.data[base + c]));
    }

    return worst;
}

/**
 * True when any pixel is even slightly opaque.
 *
 * An asset that fails this is not a bad texture, it is the absence of one: the element was
 * transparent, clipped away, or never painted at the moment it was captured. Shipping it would
 * strip the live decoration and replace it with nothing.
 */
export function hasInk(image: RawImage): boolean {
    for (let i = 3; i < image.data.length; i += 4) {
        if (image.data[i] !== 0) return true;
    }
    return false;
}

/** Byte-identical content check, used to catch one decoration baked under many ids. */
export function imageDigest(png: Buffer): string {
    return createHash('sha256').update(png).digest('hex').slice(0, 16);
}

/** True when any pixel is partially transparent - such an asset cannot ship as JPEG or GIF. */
export function needsAlpha(image: RawImage): boolean {
    for (let i = 3; i < image.data.length; i += 4) {
        if (image.data[i] !== 255) return true;
    }
    return false;
}

/** Uncompressed GPU footprint. What the texture costs in VRAM, not on disk. */
export function vramBytes(width: number, height: number): number {
    return width * height * 4;
}

export interface ComparisonResult {
    ssim: number;
    /** Largest single-channel difference; catches the 1px shifts SSIM forgives. */
    maxPixelDelta: number;
    sizeMismatch?: string;
    /** Every differing pixel is fully transparent in both images - invisible either way. */
    alphaOnlyDifference: boolean;
    differingPixels: number;
}

/**
 * Compares two captures: mean SSIM over 8x8 windows on a luma channel that has been
 * composited over black, plus a plain maximum-delta guard.
 *
 * Both images are premultiplied against black first, so a difference in alpha counts as a
 * difference in the picture - otherwise a fully transparent bake would score a perfect 1.0
 * against a fully opaque one.
 */
export function compare(first: RawImage, second: RawImage): ComparisonResult {
    // Different sizes used to short-circuit to a sentinel 0.0000 / 255, which read as nine
    // catastrophic regressions when it meant the two captures had been trimmed a pixel apart.
    // Both are placed on a shared canvas instead, so the score describes the pictures.
    const sizeMismatch =
        first.width !== second.width || first.height !== second.height
            ? `${first.width}x${first.height} vs ${second.width}x${second.height}`
            : undefined;

    const a = sizeMismatch ? padTo(first, Math.max(first.width, second.width), Math.max(first.height, second.height)) : first;
    const b = sizeMismatch ? padTo(second, Math.max(first.width, second.width), Math.max(first.height, second.height)) : second;

    const lumaA = luma(a);
    const lumaB = luma(b);

    // Differences are measured on the visible result, not the raw bytes: RGB under a fully
    // transparent pixel is whatever the renderer left there and is invisible in both images, so
    // counting it turns noise nobody can see into a failure.
    let maxPixelDelta = 0;
    let differingPixels = 0;
    let visibleDifference = false;

    for (let i = 0; i < a.data.length; i += 4) {
        const alphaA = a.data[i + 3] / 255;
        const alphaB = b.data[i + 3] / 255;

        let worst = Math.abs(a.data[i + 3] - b.data[i + 3]);
        for (let c = 0; c < 3; c++) {
            worst = Math.max(worst, Math.abs(a.data[i + c] * alphaA - b.data[i + c] * alphaB));
        }

        if (worst > 0) differingPixels++;
        if (worst > maxPixelDelta) maxPixelDelta = Math.round(worst);
        if (worst > 0 && (alphaA > 0 || alphaB > 0)) visibleDifference = true;
    }

    const C1 = (0.01 * 255) ** 2;
    const C2 = (0.03 * 255) ** 2;
    const window = 8;

    let total = 0;
    let windows = 0;

    for (let y = 0; y + window <= a.height; y += window) {
        for (let x = 0; x + window <= a.width; x += window) {
            let sumA = 0;
            let sumB = 0;
            let sumAA = 0;
            let sumBB = 0;
            let sumAB = 0;

            for (let wy = 0; wy < window; wy++) {
                for (let wx = 0; wx < window; wx++) {
                    const at = (y + wy) * a.width + (x + wx);
                    const va = lumaA[at];
                    const vb = lumaB[at];
                    sumA += va;
                    sumB += vb;
                    sumAA += va * va;
                    sumBB += vb * vb;
                    sumAB += va * vb;
                }
            }

            const n = window * window;
            const meanA = sumA / n;
            const meanB = sumB / n;
            const varianceA = sumAA / n - meanA * meanA;
            const varianceB = sumBB / n - meanB * meanB;
            const covariance = sumAB / n - meanA * meanB;

            const score =
                ((2 * meanA * meanB + C1) * (2 * covariance + C2)) /
                ((meanA * meanA + meanB * meanB + C1) * (varianceA + varianceB + C2));

            total += score;
            windows++;
        }
    }

    return {
        ssim: windows ? total / windows : 1,
        maxPixelDelta,
        sizeMismatch,
        alphaOnlyDifference: differingPixels > 0 && !visibleDifference,
        differingPixels,
    };
}

/** Places an image top-left on a larger transparent canvas so two captures can be compared. */
function padTo(image: RawImage, width: number, height: number): RawImage {
    if (image.width === width && image.height === height) return image;

    const data = Buffer.alloc(width * height * 4);
    for (let y = 0; y < image.height; y++) {
        const from = y * image.width * 4;
        image.data.copy(data, y * width * 4, from, from + image.width * 4);
    }

    return { data, width, height, channels: 4 };
}

function luma(image: RawImage): Float64Array {
    const out = new Float64Array(image.width * image.height);

    for (let i = 0, p = 0; i < image.data.length; i += 4, p++) {
        const alpha = image.data[i + 3] / 255;
        out[p] =
            (0.2126 * image.data[i] + 0.7152 * image.data[i + 1] + 0.0722 * image.data[i + 2]) * alpha;
    }

    return out;
}

/** Writes a side-by-side diff image for a failed verification. */
export async function writeDiff(a: RawImage, b: RawImage, file: string): Promise<void> {
    const width = a.width + b.width + 8;
    const height = Math.max(a.height, b.height);
    const canvas = Buffer.alloc(width * height * 4);

    const blit = (image: RawImage, offsetX: number) => {
        for (let y = 0; y < image.height; y++) {
            for (let x = 0; x < image.width; x++) {
                const from = (y * image.width + x) * 4;
                const to = (y * width + x + offsetX) * 4;
                image.data.copy(canvas, to, from, from + 4);
            }
        }
    };

    blit(a, 0);
    blit(b, a.width + 8);

    await sharp(canvas, { raw: { width, height, channels: 4 } })
        .png()
        .toFile(file);
}
