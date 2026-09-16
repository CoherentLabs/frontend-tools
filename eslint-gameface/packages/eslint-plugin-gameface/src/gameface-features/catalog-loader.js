import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { applyDelta } from "./delta.js";

/** Every catalog file consumed by buildFeatureIndex. Order doesn't matter here. */
export const CATALOG_FILES = [
  "css/supported.json",
  "css/partial.json",
  "css/unsupported.json",
  "functions/supported.json",
  "functions/unsupported.json",
  "html/supported.json",
  "html/partial.json",
  "html/unsupported.json",
  "selectors/supported.json",
  "selectors/partial.json",
  "selectors/unsupported.json",
  "js/supported.json",
  "js/partial.json",
  "js/unsupported.json",
];

/**
 * @param {string} path
 * @returns {unknown}
 */
function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

/**
 * @param {string} featuresRoot
 * @returns {import("./delta.js").VersionManifest | null}
 */
export function readManifest(featuresRoot) {
  const manifestPath = join(featuresRoot, "versions", "manifest.json");
  if (!existsSync(manifestPath)) {
    return null;
  }
  return /** @type {import("./delta.js").VersionManifest} */ (readJson(manifestPath));
}

/**
 * @param {string} featuresRoot
 * @param {string} version chain entry the delta file is named after (the *older* side of the hop)
 * @returns {{ from: string, files?: Record<string, import("./delta.js").CatalogFileDelta> } | null}
 */
function readVersionDelta(featuresRoot, version) {
  const deltaPath = join(featuresRoot, "versions", `${version}.json`);
  if (!existsSync(deltaPath)) {
    return null;
  }
  return /** @type {{ from: string, files?: Record<string, import("./delta.js").CatalogFileDelta> }} */ (
    readJson(deltaPath)
  );
}

/**
 * Hand-written corrections layered on top of every reconstructed version, applied last.
 * @param {string} featuresRoot
 * @returns {{ files?: Record<string, import("./delta.js").CatalogFileDelta> } | null}
 */
function readOverrides(featuresRoot) {
  const overridesPath = join(featuresRoot, "overrides.json");
  if (!existsSync(overridesPath)) {
    return null;
  }
  return /** @type {{ files?: Record<string, import("./delta.js").CatalogFileDelta> }} */ (readJson(overridesPath));
}

/**
 * @param {Map<string, Array<Record<string, unknown>>>} catalogs
 * @param {Record<string, import("./delta.js").CatalogFileDelta> | undefined} files
 */
function applyFileDeltas(catalogs, files) {
  if (!files) return;
  for (const [relPath, fileDelta] of Object.entries(files)) {
    catalogs.set(relPath, applyDelta(catalogs.get(relPath) ?? [], fileDelta));
  }
}

/**
 * Reads the bundled "latest" catalogs verbatim, with no delta reconstruction.
 * @param {string} featuresRoot
 * @returns {Map<string, Array<Record<string, unknown>>>}
 */
function readBaseCatalogs(featuresRoot) {
  const catalogs = new Map();
  for (const relPath of CATALOG_FILES) {
    catalogs.set(relPath, readJson(join(featuresRoot, relPath)));
  }
  return catalogs;
}

/**
 * Loads catalogs for a resolved version. `resolvedVersion` must be `manifest.base`,
 * an entry in `manifest.chain`, or `null` (no manifest / always use the base snapshot).
 * @param {string} featuresRoot absolute path to gameface-features/
 * @param {import("./delta.js").VersionManifest | null} manifest
 * @param {string | null} resolvedVersion
 * @returns {Map<string, Array<Record<string, unknown>>>}
 */
export function loadCatalogs(featuresRoot, manifest, resolvedVersion) {
  const catalogs = readBaseCatalogs(featuresRoot);

  if (manifest && resolvedVersion && resolvedVersion !== manifest.base) {
    const chain = manifest.chain ?? [manifest.base];
    const targetIndex = chain.indexOf(resolvedVersion);
    // chain[0] is the base itself (no delta file); hop i's delta file is named chain[i]
    // and describes the edit from chain[i - 1] to chain[i]. Walk forward from the base.
    for (let i = 1; i <= targetIndex; i++) {
      const delta = readVersionDelta(featuresRoot, chain[i]);
      applyFileDeltas(catalogs, delta?.files);
    }
  }

  applyFileDeltas(catalogs, readOverrides(featuresRoot)?.files);

  return catalogs;
}
