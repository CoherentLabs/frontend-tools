#!/usr/bin/env node
/**
 * Generates the baked textures used by the "is baking it worth it?" cases.
 *
 * Committed as a script rather than as loose binaries so the images are
 * reproducible and reviewable: what the texture contains is readable here
 * instead of being a blob someone has to open in an editor to understand.
 *
 *   node tools/make-baked-images.js
 *
 * Dependency-free - PNG is just zlib-deflated scanlines in a few chunks, and
 * node ships zlib.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LAB_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ------------------------------------------------------------- PNG encoding

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

/** @param {{width:number,height:number,rgba:Uint8Array}} image */
function encodePng({ width, height, rgba }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  // 10..12 stay 0: deflate, adaptive filtering, no interlace.

  // One filter byte (0 = None) per scanline.
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    raw[rowStart] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(raw, rowStart + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- rendering

const createCanvas = (width, height) => ({ width, height, rgba: new Uint8Array(width * height * 4) });

function setPixel(canvas, x, y, [r, g, b], alpha) {
  if (alpha <= 0) return;
  const i = (y * canvas.width + x) * 4;
  // Source-over onto whatever is already there, straight (non-premultiplied).
  const dstA = canvas.rgba[i + 3] / 255;
  const outA = alpha + dstA * (1 - alpha);
  if (outA <= 0) return;
  for (let c = 0; c < 3; c++) {
    const src = [r, g, b][c];
    const dst = canvas.rgba[i + c];
    canvas.rgba[i + c] = Math.round((src * alpha + dst * dstA * (1 - alpha)) / outA);
  }
  canvas.rgba[i + 3] = Math.round(outA * 255);
}

/**
 * Signed distance to a rounded rectangle: negative inside, positive outside.
 * Used both for the shape itself and as the source of the shadow's alpha mask,
 * which is what makes the edges smooth without a separate anti-aliasing pass.
 */
function roundedRectDistance(x, y, cx, cy, halfW, halfH, radius) {
  const dx = Math.abs(x - cx) - (halfW - radius);
  const dy = Math.abs(y - cy) - (halfH - radius);
  const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return outside + Math.min(Math.max(dx, dy), 0) - radius;
}

/** Three box-blur passes approximate a Gaussian closely enough for a shadow. */
function blurMask(mask, width, height, radius) {
  let current = mask;
  for (let pass = 0; pass < 3; pass++) {
    const horizontal = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let n = 0;
        for (let k = -radius; k <= radius; k++) {
          const sx = x + k;
          if (sx < 0 || sx >= width) continue;
          sum += current[y * width + sx];
          n++;
        }
        horizontal[y * width + x] = sum / n;
      }
    }
    const vertical = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let n = 0;
        for (let k = -radius; k <= radius; k++) {
          const sy = y + k;
          if (sy < 0 || sy >= height) continue;
          sum += horizontal[sy * width + x];
          n++;
        }
        vertical[y * width + x] = sum / n;
      }
    }
    current = vertical;
  }
  return current;
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
/** Distance -> coverage, giving roughly one pixel of anti-aliasing. */
const coverage = (distance) => clamp01(0.5 - distance);

// ------------------------------------------------------------------ targets

/**
 * cases/box-shadow-baked/shadow-baked.png
 *
 * The A (baked) side of "live box-shadow vs a pre-rendered texture": a rounded
 * rect with its drop shadow already burned in.
 *
 * Matches B's CSS as closely as a texture can:
 *   border-radius: 6px; background: #2a4a6a;
 *   box-shadow: 0 4px 12px rgba(0,0,0,0.8);
 * The one thing it cannot match is extent - a live box-shadow paints outside
 * the border box, a background image cannot. See the case's notes.
 */
function bakedShadow() {
  // The lab's standard tile. The rect inside it is inset by 10px on every side,
  // because a texture has to reserve margin for a shadow where CSS just paints
  // it outside the border box. B compensates with a 68x44 box plus a 10px
  // margin, so both variants land the same pixels in the same place.
  const width = 88;
  const height = 64;
  const canvas = createCanvas(width, height);

  const cx = width / 2;
  const cy = height / 2;
  const halfW = width / 2 - 10;
  const halfH = height / 2 - 10;
  const radius = 6;

  const mask = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // The shadow is the same shape, offset down by 4px.
      mask[y * width + x] = coverage(roundedRectDistance(x, y - 4, cx, cy, halfW, halfH, radius));
    }
  }
  // box-shadow's blur radius is roughly twice the Gaussian sigma; 12px blur.
  const blurred = blurMask(mask, width, height, 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      setPixel(canvas, x, y, [0, 0, 0], clamp01(blurred[y * width + x]) * 0.8);
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      setPixel(canvas, x, y, [0x2a, 0x4a, 0x6a], coverage(roundedRectDistance(x, y, cx, cy, halfW, halfH, radius)));
    }
  }

  return { path: join(LAB_ROOT, "cases", "box-shadow-baked", "shadow-baked.png"), canvas };
}

/**
 * cases/gradient-clip-baked/gradient-clip-baked.png
 *
 * The A (baked) side of "live gradient + clip-path vs a pre-rendered texture".
 * Unlike the shadow, this one can be pixel-faithful: clip-path clips inside the
 * border box, so a texture can reproduce it exactly.
 *
 * Matches B's CSS:
 *   background-image: linear-gradient(135deg, #ff7a18, #af002d);
 *   clip-path: polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%);
 */
function bakedGradientClip() {
  const width = 88;
  const height = 64;
  const canvas = createCanvas(width, height);

  const from = [0xff, 0x7a, 0x18];
  const to = [0xaf, 0x00, 0x2d];
  // A 135deg CSS gradient runs from the top-left corner toward the bottom-right.
  const polygon = [
    [0.12 * width, 0],
    [1.0 * width, 0],
    [0.88 * width, height],
    [0.0 * width, height],
  ];

  const inPolygon = (px, py) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!inPolygon(x + 0.5, y + 0.5)) continue;
      const t = clamp01((x / width + y / height) / 2);
      const colour = [0, 1, 2].map((c) => Math.round(from[c] + (to[c] - from[c]) * t));
      setPixel(canvas, x, y, colour, 1);
    }
  }

  return { path: join(LAB_ROOT, "cases", "gradient-clip-baked", "gradient-clip-baked.png"), canvas };
}

/**
 * The same artwork rendered at two resolutions, for
 * image-oversized-vs-sized (and reused as the scrolling texture in
 * bg-position-vs-transform).
 *
 * Drawn from normalised coordinates so both sizes are the *same picture*: the
 * 4x version scaled down by CSS must look like the native one, otherwise the
 * case would be comparing two different images rather than two ways of
 * delivering one.
 */
function patternAt(width, height) {
  const canvas = createCanvas(width, height);
  const stripeA = [0x2a, 0x4a, 0x6a];
  const stripeB = [0x1c, 0x30, 0x46];
  const dot = [0xd8, 0x8a, 0x3a];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = (x + 0.5) / width;
      const v = (y + 0.5) / height;

      const stripe = ((u * 6 + v * 6) % 1) < 0.5 ? stripeA : stripeB;
      setPixel(canvas, x, y, stripe, 1);

      // A circle in the middle, so any resampling difference is obvious to the
      // eye rather than hidden in a flat field.
      const dx = u - 0.5;
      const dy = v - 0.5;
      const r = Math.sqrt(dx * dx + dy * dy * (height / width) * (height / width));
      if (r < 0.22) setPixel(canvas, x, y, dot, 1);
    }
  }
  return canvas;
}

const TILE = { width: 88, height: 64 };
const OVERSAMPLE = 4;

/**
 * One sprite of the atlas used by many-images-vs-spritesheet: a distinct
 * two-tone design per index, so the two variants can be told apart by eye and
 * so no two sprites are byte-identical (which could let the engine dedupe them
 * and quietly turn N textures into one).
 */
function spriteAt(canvas, originX, originY, index) {
  const hue = (index * 47) % 360;
  const channel = (deg) => {
    const k = (((deg / 60) % 6) + 6) % 6;
    return Math.round(40 + 150 * Math.max(0, Math.min(1, 2 - Math.abs(k - 3))));
  };
  const base = [channel(hue), channel(hue + 240), channel(hue + 120)];
  const accent = [channel(hue + 180), channel(hue + 60), channel(hue + 300)];

  for (let y = 0; y < TILE.height; y++) {
    for (let x = 0; x < TILE.width; x++) {
      const u = (x + 0.5) / TILE.width;
      const v = (y + 0.5) / TILE.height;
      // A wedge whose angle depends on the index, so each sprite is distinct.
      const inWedge = (u * (1 + (index % 4)) + v) % 1 < 0.45;
      setPixel(canvas, originX + x, originY + y, inWedge ? accent : base, 1);
    }
  }
}

const SPRITES = 16;
const SHEET_COLS = 4;

function spriteSheet() {
  const canvas = createCanvas(TILE.width * SHEET_COLS, TILE.height * (SPRITES / SHEET_COLS));
  for (let i = 0; i < SPRITES; i++) {
    spriteAt(canvas, (i % SHEET_COLS) * TILE.width, Math.floor(i / SHEET_COLS) * TILE.height, i);
  }
  return canvas;
}

function loneSprite(index) {
  const canvas = createCanvas(TILE.width, TILE.height);
  spriteAt(canvas, 0, 0, index);
  return canvas;
}

const targets = [
  bakedShadow(),
  bakedGradientClip(),
  {
    path: join(LAB_ROOT, "cases", "image-oversized-vs-sized", "image-sized.png"),
    canvas: patternAt(TILE.width, TILE.height),
  },
  {
    path: join(LAB_ROOT, "cases", "image-oversized-vs-sized", "image-oversized.png"),
    canvas: patternAt(TILE.width * OVERSAMPLE, TILE.height * OVERSAMPLE),
  },
  {
    path: join(LAB_ROOT, "cases", "bg-position-vs-transform", "pattern.png"),
    canvas: patternAt(TILE.width * 2, TILE.height * 2),
  },
  // The atlas, and the same sprites again as separate files. Both variants of
  // many-images-vs-spritesheet therefore show pixel-identical artwork; only the
  // number of textures behind it differs.
  //
  // spritesheet-vs-files-churn asks the same question of element creation
  // rather than of steady-state drawing, so it needs the same assets. They are
  // emitted twice from the same spriteAt() rather than copied, which is what
  // keeps "the same artwork" true across both cases.
  ...["many-images-vs-spritesheet", "spritesheet-vs-files-churn"].flatMap((caseId) => [
    {
      path: join(LAB_ROOT, "cases", caseId, "sheet.png"),
      canvas: spriteSheet(),
    },
    ...Array.from({ length: SPRITES }, (_, i) => ({
      path: join(LAB_ROOT, "cases", caseId, `sprite-${i}.png`),
      canvas: loneSprite(i),
    })),
  ]),
];

for (const { path, canvas } of targets) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodePng(canvas));
  console.log(`wrote ${path} (${canvas.width}x${canvas.height})`);
}
