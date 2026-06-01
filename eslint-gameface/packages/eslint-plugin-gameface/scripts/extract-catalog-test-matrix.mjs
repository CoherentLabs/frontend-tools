import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCssMatrixRows } from "./lib/matrix-builders/css.mjs";
import { buildHtmlMatrixRows } from "./lib/matrix-builders/html.mjs";
import { buildJsMatrixRows } from "./lib/matrix-builders/js.mjs";
import { buildDatabindMatrixRows } from "./lib/matrix-builders/databind.mjs";
import { buildFunctionsMatrixRows } from "./lib/matrix-builders/functions.mjs";
import { buildRestrictionsMatrixRows } from "./lib/matrix-builders/restrictions.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginRoot = join(__dirname, "..");
const featuresRoot = join(pluginRoot, "gameface-features");
const outDir = join(pluginRoot, "tests", "generated");
const outFile = join(outDir, "test-matrix.json");

export const SAMPLE_SEED = 42;

export const MAX_PER_CATEGORY = {
  cssUnsupported: 100,
  cssPartial: 100,
  selectorsUnsupported: 100,
  selectorsPartial: 100,
  htmlParsedNoImpl: 200,
  htmlPartialAttrs: 100,
  jsUnsupported: 200,
  jsPartialMembers: 150,
  functionsUnsupported: 100,
};

/**
 * @param {string} relativePath
 */
function readCatalog(relativePath) {
  const full = join(featuresRoot, relativePath);
  return JSON.parse(readFileSync(full, "utf8"));
}

/**
 * @param {unknown} data
 */
function asRows(data) {
  return Array.isArray(data) ? data : [];
}

export function buildTestMatrix() {
  const cssUnsupported = asRows(readCatalog("css/unsupported.json"));
  const cssPartial = asRows(readCatalog("css/partial.json"));
  const selectorsUnsupported = asRows(readCatalog("selectors/unsupported.json"));
  const selectorsPartial = asRows(readCatalog("selectors/partial.json"));
  const htmlUnsupported = asRows(readCatalog("html/unsupported.json"));
  const htmlPartial = asRows(readCatalog("html/partial.json"));
  const jsUnsupported = asRows(readCatalog("js/unsupported.json"));
  const jsPartial = asRows(readCatalog("js/partial.json"));
  const functionsUnsupported = asRows(readCatalog("functions/unsupported.json"));

  const rows = [
    ...buildCssMatrixRows(
      cssUnsupported,
      cssPartial,
      selectorsUnsupported,
      selectorsPartial,
      SAMPLE_SEED,
      MAX_PER_CATEGORY,
    ),
    ...buildHtmlMatrixRows(htmlUnsupported, htmlPartial, SAMPLE_SEED, MAX_PER_CATEGORY),
    ...buildJsMatrixRows(jsUnsupported, jsPartial, SAMPLE_SEED, MAX_PER_CATEGORY),
    ...buildDatabindMatrixRows(),
    ...buildFunctionsMatrixRows(functionsUnsupported, SAMPLE_SEED, MAX_PER_CATEGORY),
    ...buildRestrictionsMatrixRows(),
  ];

  const byId = new Map();
  for (const row of rows) {
    if (byId.has(row.id)) {
      throw new Error(`duplicate matrix id: ${row.id}`);
    }
    byId.set(row.id, row);
  }

  return {
    version: 1,
    seed: SAMPLE_SEED,
    caps: MAX_PER_CATEGORY,
    generatedAt: new Date().toISOString(),
    rowCount: rows.length,
    rows,
  };
}

function main() {
  const matrix = buildTestMatrix();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(matrix)}\n`, "utf8");
  console.log(`Wrote ${matrix.rowCount} rows to ${outFile}`);
}

const isMain =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main();
}
