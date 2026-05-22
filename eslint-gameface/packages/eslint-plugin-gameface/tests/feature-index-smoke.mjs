import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { clearFeatureIndexCache, getFeatureIndex } from "../src/gameface-features/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const matrixPath = join(__dirname, "generated", "test-matrix.json");

clearFeatureIndexCache();
const i = getFeatureIndex();

const iUnknownVersion = getFeatureIndex("unknown-version-dir-not-present");
if (i.cssSupportedCount !== iUnknownVersion.cssSupportedCount) {
  throw new Error("unknown version should fall back to latest catalogs");
}

clearFeatureIndexCache();
const iLatestExplicit = getFeatureIndex("latest");
if (iLatestExplicit.cssSupportedCount !== getFeatureIndex().cssSupportedCount) {
  throw new Error("explicit latest should match default");
}

if (!i.cssPropertiesUnsupported.has("accent-color")) {
  throw new Error("expected accent-color in cssPropertiesUnsupported");
}
if (!i.cssFunctionsUnsupported.has("clamp")) {
  throw new Error("expected clamp in cssFunctionsUnsupported");
}
if (!i.cssFunctionsUnsupported.has("min") || !i.cssFunctionsUnsupported.has("max")) {
  throw new Error("expected min/max in cssFunctionsUnsupported");
}
if (i.cssFunctionsUnsupported.has("url")) {
  throw new Error("did not expect unknown-status url in cssFunctionsUnsupported");
}
if (i.cssFunctionsSupportedCount < 50) {
  throw new Error(
    `expected cssFunctionsSupportedCount >= 50, got ${i.cssFunctionsSupportedCount}`,
  );
}
if (!i.htmlTagsPartial.has("canvas")) {
  throw new Error("expected canvas in htmlTagsPartial");
}
if (!i.cssPropertiesPartial.has("align-content")) {
  throw new Error("expected align-content in cssPropertiesPartial");
}
if (!i.htmlTagsSupported.has("div")) {
  throw new Error("expected div in htmlTagsSupported");
}
if (!i.htmlTagsParsedNoImpl.has("select")) {
  throw new Error("expected select in htmlTagsParsedNoImpl (parsed-no-impl only)");
}
if (i.htmlTagsParsedNoImpl.has("selectedcontent")) {
  throw new Error("did not expect unknown-status tag selectedcontent in parsed-no-impl map");
}
if (!i.selectorNamesUnsupported.has(":any-link")) {
  throw new Error("expected :any-link in selectorNamesUnsupported");
}
if (!i.jsApisUnsupported.has("Chrome")) {
  throw new Error("expected Chrome in jsApisUnsupported");
}
if (!i.jsTypesPartial.has("Animation")) {
  throw new Error("expected Animation in jsTypesPartial");
}
if (!i.jsTypesPartial.get("Animation").has("effect")) {
  throw new Error("expected Animation.effect in jsTypesPartial");
}

const raw = getFeatureIndex(undefined, { rawCatalog: true });
if (!raw.jsTypesPartial.get("CSS")?.has("px")) {
  throw new Error("raw catalog should still list CSS.px as missing");
}
if (i.jsTypesPartial.get("CSS")?.has("px")) {
  throw new Error("default whitelist should remove CSS.px from jsTypesPartial");
}
if (!i.jsTypesSupported.has("CoherentDebug")) {
  throw new Error("expected CoherentDebug in jsTypesSupported");
}

if (i.cssSupportedCount < 5) {
  throw new Error(`expected cssSupportedCount >= 5, got ${i.cssSupportedCount}`);
}
if (i.cssPropertiesUnsupported.size < 200) {
  throw new Error(
    `expected cssPropertiesUnsupported.size >= 200, got ${i.cssPropertiesUnsupported.size}`,
  );
}
if (i.cssPropertiesPartial.size < 100) {
  throw new Error(
    `expected cssPropertiesPartial.size >= 100, got ${i.cssPropertiesPartial.size}`,
  );
}
if (i.jsApisUnsupported.size < 50) {
  throw new Error(`expected jsApisUnsupported.size >= 50, got ${i.jsApisUnsupported.size}`);
}

let matrix;
try {
  matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
} catch {
  throw new Error(`missing ${matrixPath}; run: npm run test:extract-matrix`);
}
if (matrix.version !== 1 || matrix.seed !== 42) {
  throw new Error("test-matrix.json has unexpected version/seed");
}
if (!Array.isArray(matrix.rows) || matrix.rows.length < 100) {
  throw new Error(`expected >= 100 catalog matrix rows, got ${matrix.rows?.length ?? 0}`);
}

console.log("feature-index-smoke: ok");
