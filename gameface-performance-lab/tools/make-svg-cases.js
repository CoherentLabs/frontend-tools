#!/usr/bin/env node
/**
 * Generates the asset pairs used by the "is SVG more expensive than PNG?"
 * cases (png-vs-svg-static-complex, png-vs-svg-churn-complex,
 * png-vs-svg-churn-simple).
 *
 *   node tools/make-svg-cases.js
 *
 * Rule 4's exception applies to these cases - the asset format IS the variable
 * - which puts the whole weight of the comparison on the two files being the
 * same picture. So the SVG is the source of truth and the PNG is rasterised
 * from that exact SVG here, rather than the two being drawn by separate code
 * that could drift apart.
 *
 * Unlike make-baked-images.js this one is not dependency-free: turning path
 * data into pixels needs a real renderer (@resvg/resvg-js, a devDependency).
 * The SVG stays committed and readable, so the PNG is still reproducible from
 * source rather than being an opaque blob.
 *
 * Two complexity tiers, because a synthetic sprite of a dozen shapes would
 * understate what a real asset costs and could return a false null:
 *
 *   simple  - flat bands and one star. What a UI icon looks like.
 *   complex - the same base plus a many-path emblem, sized to land in the same
 *             file-size range as the production flag assets that prompted
 *             these cases (~100-200 KB).
 */

import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LAB_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const TILE = { width: 88, height: 64 };

// ------------------------------------------------------------------ drawing

/**
 * Fixed-seed PRNG (mulberry32). Rule 7: two runs of this script must emit
 * byte-identical files, or the PNG and the SVG in a case could stop being the
 * same picture between regenerations.
 */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (value) => Number(value.toFixed(2));

/** Bands and a star: the shared base of both tiers. */
function baseShapes() {
  return [
    `<rect width="88" height="64" fill="#1c3046"/>`,
    `<rect y="18" width="88" height="28" fill="#2a4a6a"/>`,
    `<rect y="46" width="88" height="18" fill="#16283a"/>`,
    `<path d="M44 12 L48.7 25.4 L62.8 25.7 L51.5 34.2 L55.7 47.8 L44 39.7 L32.3 47.8 L36.5 34.2 L25.2 25.7 L39.3 25.4 Z" fill="#d88a3a"/>`,
  ];
}

/**
 * `count` filled bezier petals fanned around the centre. This is the knob that
 * makes "complex" complex: it is what a coat of arms or a detailed emblem
 * costs a rasteriser - many small curved paths, each needing its own fill.
 */
function emblemShapes(count, seed) {
  const random = rng(seed);
  const shapes = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 * 7;
    const radius = 6 + (i / count) * 22;
    const cx = 44 + Math.cos(angle) * radius * 1.3;
    const cy = 32 + Math.sin(angle) * radius;
    const size = 1.6 + random() * 3.4;
    const tilt = random() * Math.PI * 2;

    const px = (r, t) => n(cx + Math.cos(tilt + t) * size * r);
    const py = (r, t) => n(cy + Math.sin(tilt + t) * size * r);

    // A four-segment closed curve, so every path carries real bezier work
    // rather than being a rectangle in disguise.
    const d =
      `M${px(1, 0)} ${py(1, 0)}` +
      `C${px(1.4, 0.9)} ${py(1.4, 0.9)} ${px(1.4, 2.2)} ${py(1.4, 2.2)} ${px(1, 3.14)} ${py(1, 3.14)}` +
      `C${px(0.6, 4.0)} ${py(0.6, 4.0)} ${px(0.6, 5.4)} ${py(0.6, 5.4)} ${px(1, 0)} ${py(1, 0)}Z`;

    const hue = Math.round(random() * 60) + 190;
    const light = 30 + Math.round(random() * 35);
    shapes.push(`<path d="${d}" fill="hsl(${hue} 55% ${light}%)" opacity="0.85"/>`);
  }

  return shapes;
}

function svgDocument(shapes) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE.width}" height="${TILE.height}" ` +
    `viewBox="0 0 ${TILE.width} ${TILE.height}">` +
    shapes.join("") +
    `</svg>\n`
  );
}

// ------------------------------------------------------------------ targets

// Tuned so the complex sprite lands in the size range of the production flag
// assets (the largest was 209 KB) rather than in synthetic-toy territory.
const EMBLEM_PATHS = 900;

const SIMPLE = svgDocument(baseShapes());
const COMPLEX = svgDocument([...baseShapes(), ...emblemShapes(EMBLEM_PATHS, 0x5eed)]);

const targets = [
  { case: "png-vs-svg-static-complex", svg: COMPLEX },
  { case: "png-vs-svg-churn-complex", svg: COMPLEX },
  { case: "png-vs-svg-churn-simple", svg: SIMPLE },
];

for (const target of targets) {
  const dir = join(LAB_ROOT, "cases", target.case);
  mkdirSync(dir, { recursive: true });

  // Rasterised at exactly the size the tile displays it at: image-oversized-vs-sized
  // found no per-frame penalty for oversizing, but a native-size texture is the
  // recommended form and A is always the recommended form.
  const png = new Resvg(target.svg, { fitTo: { mode: "width", value: TILE.width } }).render().asPng();

  writeFileSync(join(dir, "sprite.svg"), target.svg);
  writeFileSync(join(dir, "sprite.png"), png);
  console.log(
    `wrote ${target.case}/sprite.{svg,png}  ` +
      `(svg ${(target.svg.length / 1024).toFixed(1)} KB, png ${(png.length / 1024).toFixed(1)} KB)`
  );
}
