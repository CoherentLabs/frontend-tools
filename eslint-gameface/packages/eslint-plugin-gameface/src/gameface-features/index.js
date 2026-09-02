import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_CATALOG_WHITELISTS } from "../data/catalog-whitelists.js";
import { applyCatalogWhitelists } from "../utils/catalog-whitelist.js";
import { normalizeCssPropertyName } from "../utils/css-property-name.js";
import { DEFAULT_GAMEFACE_VERSION, getGamefaceVersionFromContext, normalizeGamefaceVersionSetting } from "../utils/eslint-gameface-settings.js";
import { loadCatalogs, readManifest } from "./catalog-loader.js";
import { resolveVersion } from "./delta.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** gameface-features/ at package root (sibling of src/): the "latest" snapshot, plus versions/ deltas */
const FEATURES_ROOT = join(__dirname, "..", "..", "gameface-features");

/**
 * Always the directory holding the base ("latest") catalogs. Older versions are
 * reconstructed in memory from `gameface-features/versions/*.json` deltas
 * (see {@link loadCatalogs}) rather than read from a per-version directory.
 * @param {string} [_version] unused; kept for backward compatibility
 * @returns {string}
 */
export function resolveGamefaceFeaturesRoot(_version) {
  return FEATURES_ROOT;
}

/**
 * @param {unknown} data
 * @returns {Array<{ status?: string, surface?: string, name?: string, evidence?: Record<string, unknown> }>}
 */
function asFeatureRows(data) {
  return Array.isArray(data) ? data : [];
}

/**
 * @typedef {Object} GamefaceFeatureIndex
 * @property {ReadonlySet<string>} cssPropertiesUnsupported
 * @property {ReadonlyMap<string, Record<string, unknown>>} cssPropertiesPartial
 * @property {number} cssSupportedCount
 * @property {ReadonlySet<string>} cssFunctionsUnsupported
 * @property {number} cssFunctionsSupportedCount
 * @property {ReadonlySet<string>} htmlTagsSupported
 * @property {ReadonlyMap<string, Record<string, unknown>>} htmlTagsPartial
 * @property {ReadonlyMap<string, Record<string, unknown>>} htmlTagsParsedNoImpl
 * @property {ReadonlySet<string>} selectorNamesUnsupported
 * @property {ReadonlyMap<string, Record<string, unknown>>} selectorNamesPartial
 * @property {ReadonlySet<string>} selectorNamesSupported
 * @property {ReadonlySet<string>} jsApisUnsupported
 * @property {ReadonlyMap<string, ReadonlySet<string>>} jsTypesPartial type name -> set of missing member names (from `evidence.missing`)
 * @property {ReadonlySet<string>} jsTypesSupported
 * @property {number} jsSupportedCount
 * @property {number} jsPartialCount
 */

/**
 * `data-bind-style-<name>`: allowed when `<name>` is not listed as missing/unsupported
 * in gameface-features/css/unsupported.json (css-property rows). Names absent from that file are allowed (permissive).
 * Rejects custom properties (`--*`) and invalid characters.
 * @param {string} cssPropertyName e.g. "width", "background-color"
 * @param {GamefaceFeatureIndex} index
 * @returns {boolean}
 */
export function isCssPropertyAllowedForDataBindStyle(cssPropertyName, index) {
  const n =
    typeof cssPropertyName === "string"
      ? normalizeCssPropertyName(cssPropertyName)
      : "";
  if (!n || n.startsWith("--") || !/^[a-z0-9-]+$/.test(n)) {
    return false;
  }
  return !index.cssPropertiesUnsupported.has(n);
}

/** Suffix for cache entries built without the internal catalog whitelist. */
const RAW_CATALOG_CACHE_SUFFIX = "\0raw";

/**
 * @typedef {Object} GetFeatureIndexOptions
 * @property {boolean} [rawCatalog] For plugin tests only: skip internal whitelist.
 */

/** @type {Map<string, GamefaceFeatureIndex>} */
const cache = new Map();

/**
 * @param {GetFeatureIndexOptions | undefined} options
 * @returns {boolean}
 */
function shouldApplyInternalCatalogWhitelist(options) {
  if (options?.rawCatalog === true) {
    return false;
  }
  if (process.env.GAMEFACE_INTERNAL_RAW_CATALOG === "1") {
    return false;
  }
  return true;
}

/**
 * @param {Map<string, unknown>} catalogs relative path -> parsed JSON (from {@link loadCatalogs})
 * @returns {GamefaceFeatureIndex}
 */
function buildFeatureIndex(catalogs) {
  const cssSupported = asFeatureRows(catalogs.get("css/supported.json"));
  const cssPartial = asFeatureRows(catalogs.get("css/partial.json"));
  const cssUnsupported = asFeatureRows(catalogs.get("css/unsupported.json"));
  const functionsSupported = asFeatureRows(catalogs.get("functions/supported.json"));
  const functionsUnsupported = asFeatureRows(catalogs.get("functions/unsupported.json"));

  /** @type {Set<string>} */
  const cssPropertiesUnsupported = new Set();
  for (const row of cssUnsupported) {
    if (row.surface === "css-property" && typeof row.name === "string") {
      if (row.status === "missing" || row.status === "unsupported") {
        cssPropertiesUnsupported.add(row.name.toLowerCase());
      }
    }
  }

  /** @type {Map<string, Record<string, unknown>>} */
  const cssPropertiesPartial = new Map();
  for (const row of cssPartial) {
    if (row.surface === "css-property" && row.status === "partial" && typeof row.name === "string") {
      cssPropertiesPartial.set(row.name.toLowerCase(), row.evidence || {});
    }
  }

  /** @type {Set<string>} */
  const cssFunctionsUnsupported = new Set();
  for (const row of functionsUnsupported) {
    if (row.surface === "css-function" && typeof row.name === "string" && row.status === "missing") {
      cssFunctionsUnsupported.add(row.name.toLowerCase());
    }
  }

  const htmlSupported = asFeatureRows(catalogs.get("html/supported.json"));
  const htmlPartial = asFeatureRows(catalogs.get("html/partial.json"));
  const htmlUnsupported = asFeatureRows(catalogs.get("html/unsupported.json"));

  /** @type {Set<string>} */
  const htmlTagsSupported = new Set();
  for (const row of htmlSupported) {
    if (row.surface === "html" && typeof row.name === "string") {
      htmlTagsSupported.add(row.name.toLowerCase());
    }
  }

  /** @type {Map<string, Record<string, unknown>>} */
  const htmlTagsPartial = new Map();
  for (const row of htmlPartial) {
    if (row.surface === "html" && row.status === "partial" && typeof row.name === "string") {
      htmlTagsPartial.set(row.name.toLowerCase(), row.evidence || {});
    }
  }

  /** @type {Map<string, Record<string, unknown>>} */
  const htmlTagsParsedNoImpl = new Map();
  for (const row of htmlUnsupported) {
    if (
      row.surface === "html" &&
      typeof row.name === "string" &&
      row.status === "parsed-no-impl"
    ) {
      htmlTagsParsedNoImpl.set(row.name.toLowerCase(), row.evidence || {});
    }
  }

  const selectorsSupported = asFeatureRows(catalogs.get("selectors/supported.json"));
  const selectorsPartial = asFeatureRows(catalogs.get("selectors/partial.json"));
  const selectorsUnsupported = asFeatureRows(catalogs.get("selectors/unsupported.json"));

  /** @type {Set<string>} */
  const selectorNamesUnsupported = new Set();
  for (const row of selectorsUnsupported) {
    if (row.surface === "css-selector" && typeof row.name === "string") {
      selectorNamesUnsupported.add(row.name);
    }
  }

  /** @type {Map<string, Record<string, unknown>>} */
  const selectorNamesPartial = new Map();
  for (const row of selectorsPartial) {
    if (row.surface === "css-selector" && typeof row.name === "string") {
      selectorNamesPartial.set(row.name, row.evidence || {});
    }
  }

  /** @type {Set<string>} */
  const selectorNamesSupported = new Set();
  for (const row of selectorsSupported) {
    if (row.surface === "css-selector" && typeof row.name === "string") {
      selectorNamesSupported.add(row.name);
    }
  }

  const jsSupported = asFeatureRows(catalogs.get("js/supported.json"));
  const jsPartial = asFeatureRows(catalogs.get("js/partial.json"));
  const jsUnsupported = asFeatureRows(catalogs.get("js/unsupported.json"));

  /** @type {Set<string>} */
  const jsApisUnsupported = new Set();
  /** @type {Map<string, Set<string>>} */
  const jsTypesPartial = new Map();

  /**
   * @param {string} name
   * @param {unknown} evidence
   */
  function recordPartialMembers(name, evidence) {
    if (!evidence || typeof evidence !== "object") {
      return;
    }
    const missing = /** @type {{ missing?: unknown }} */ (evidence).missing;
    if (!Array.isArray(missing) || missing.length === 0) {
      return;
    }
    let set = jsTypesPartial.get(name);
    if (!set) {
      set = new Set();
      jsTypesPartial.set(name, set);
    }
    for (const m of missing) {
      if (typeof m === "string" && m.length > 0) {
        set.add(m);
      }
    }
  }

  for (const row of jsUnsupported) {
    if (row.surface === "js" && typeof row.name === "string") {
      if (
        row.status === "missing-from-window" ||
        row.status === "missing" ||
        row.status === "unsupported"
      ) {
        jsApisUnsupported.add(row.name);
      }
      // Unsupported rows may still carry `evidence.missing` (e.g. AbortController.signal):
      // record those so member access on the type can still be reported.
      recordPartialMembers(row.name, row.evidence);
    }
  }

  for (const row of jsPartial) {
    if (row.surface === "js" && row.status === "partial" && typeof row.name === "string") {
      recordPartialMembers(row.name, row.evidence);
    }
  }

  /** @type {Set<string>} */
  const jsTypesSupported = new Set();
  for (const row of jsSupported) {
    if (row.surface === "js" && typeof row.name === "string") {
      jsTypesSupported.add(row.name);
    }
  }

  return {
    cssPropertiesUnsupported,
    cssPropertiesPartial,
    cssSupportedCount: cssSupported.length,
    cssFunctionsUnsupported,
    cssFunctionsSupportedCount: functionsSupported.length,
    htmlTagsSupported,
    htmlTagsPartial,
    htmlTagsParsedNoImpl,
    selectorNamesUnsupported,
    selectorNamesPartial,
    selectorNamesSupported,
    jsApisUnsupported,
    jsTypesPartial,
    jsTypesSupported,
    jsSupportedCount: jsSupported.length,
    jsPartialCount: jsPartial.length,
  };
}

/** Requested version strings already warned about (nearest-known fallback was used). */
const warnedVersions = new Set();

/**
 * @param {string} requested
 * @param {string} resolved
 */
function warnUnknownVersion(requested, resolved) {
  if (warnedVersions.has(requested)) {
    return;
  }
  warnedVersions.add(requested);
  console.warn(
    `[eslint-plugin-gameface] settings.gameface.version "${requested}" has no bundled feature data; using nearest known version "${resolved}" instead.`
  );
}

/**
 * Loads and indexes catalogs for a version. When the resolved version isn't the base
 * ("latest") snapshot, it's reconstructed in memory from `gameface-features/versions/*.json`
 * deltas (see {@link loadCatalogs}). Memoized per resolved version + whitelist set.
 * @param {string} [version] ESLint `settings.gameface.version`, or omit / `"latest"` for the base snapshot.
 * @param {GetFeatureIndexOptions} [options]
 * @returns {GamefaceFeatureIndex}
 */
export function getFeatureIndex(version, options) {
  const versionKey =
    version === undefined || version === null
      ? DEFAULT_GAMEFACE_VERSION
      : normalizeGamefaceVersionSetting(String(version));

  const manifest = readManifest(FEATURES_ROOT);
  let resolvedVersion = manifest?.base ?? null;
  if (manifest) {
    const resolution = resolveVersion(versionKey, manifest);
    resolvedVersion = resolution.version;
    if (!resolution.exact) {
      warnUnknownVersion(versionKey, resolvedVersion);
    }
  }

  const applyWhitelist = shouldApplyInternalCatalogWhitelist(options);
  const cacheVersionKey = resolvedVersion ?? DEFAULT_GAMEFACE_VERSION;
  const cacheKey = applyWhitelist ? cacheVersionKey : `${cacheVersionKey}${RAW_CATALOG_CACHE_SUFFIX}`;
  const hit = cache.get(cacheKey);
  if (hit) {
    return hit;
  }
  const catalogs = loadCatalogs(FEATURES_ROOT, manifest, resolvedVersion);
  const index = buildFeatureIndex(catalogs);
  if (applyWhitelist) {
    applyCatalogWhitelists(index, DEFAULT_CATALOG_WHITELISTS);
  }
  cache.set(cacheKey, index);
  return index;
}

/**
 * @param {import("eslint").Rule.RuleContext} context
 * @returns {GamefaceFeatureIndex}
 */
export function getFeatureIndexForContext(context) {
  return getFeatureIndex(getGamefaceVersionFromContext(context));
}

/**
 * @returns {void}
 */
export function clearFeatureIndexCache() {
  cache.clear();
  warnedVersions.clear();
}
