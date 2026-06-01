import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_CATALOG_WHITELISTS } from "../data/catalog-whitelists.js";
import { applyCatalogWhitelists } from "../utils/catalog-whitelist.js";
import { normalizeCssPropertyName } from "../utils/css-property-name.js";
import { DEFAULT_GAMEFACE_VERSION, getGamefaceVersionFromContext, normalizeGamefaceVersionSetting } from "../utils/eslint-gameface-settings.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** gameface-features/ at package root (sibling of src/) */
const FEATURES_ROOT = join(__dirname, "..", "..", "gameface-features");

/**
 * @param {string} version normalized setting (no path separators)
 * @returns {string} absolute directory containing css/, functions/, html/, selectors/, js/
 */
export function resolveGamefaceFeaturesRoot(version) {
  const v = version || DEFAULT_GAMEFACE_VERSION;
  if (v === DEFAULT_GAMEFACE_VERSION) {
    return FEATURES_ROOT;
  }
  const underVersions = join(FEATURES_ROOT, "versions", v);
  if (existsSync(underVersions)) {
    return underVersions;
  }
  return FEATURES_ROOT;
}

/**
 * @param {string} featuresRoot
 * @param {string} relativePath
 * @returns {unknown}
 */
function readFeatureJson(featuresRoot, relativePath) {
  const full = join(featuresRoot, relativePath);
  return JSON.parse(readFileSync(full, "utf8"));
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
 * @param {string} featuresRoot
 * @returns {GamefaceFeatureIndex}
 */
function buildFeatureIndex(featuresRoot) {
  const cssSupported = asFeatureRows(readFeatureJson(featuresRoot, "css/supported.json"));
  const cssPartial = asFeatureRows(readFeatureJson(featuresRoot, "css/partial.json"));
  const cssUnsupported = asFeatureRows(readFeatureJson(featuresRoot, "css/unsupported.json"));
  const functionsSupported = asFeatureRows(readFeatureJson(featuresRoot, "functions/supported.json"));
  const functionsUnsupported = asFeatureRows(readFeatureJson(featuresRoot, "functions/unsupported.json"));

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

  const htmlSupported = asFeatureRows(readFeatureJson(featuresRoot, "html/supported.json"));
  const htmlPartial = asFeatureRows(readFeatureJson(featuresRoot, "html/partial.json"));
  const htmlUnsupported = asFeatureRows(readFeatureJson(featuresRoot, "html/unsupported.json"));

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

  const selectorsSupported = asFeatureRows(readFeatureJson(featuresRoot, "selectors/supported.json"));
  const selectorsPartial = asFeatureRows(readFeatureJson(featuresRoot, "selectors/partial.json"));
  const selectorsUnsupported = asFeatureRows(readFeatureJson(featuresRoot, "selectors/unsupported.json"));

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

  const jsSupported = asFeatureRows(readFeatureJson(featuresRoot, "js/supported.json"));
  const jsPartial = asFeatureRows(readFeatureJson(featuresRoot, "js/partial.json"));
  const jsUnsupported = asFeatureRows(readFeatureJson(featuresRoot, "js/unsupported.json"));

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

/**
 * Loads and indexes JSON under the resolved features root. Memoized per version + whitelist set.
 * @param {string} [version] ESLint `settings.gameface.version`, or omit / `"latest"` for shipped catalogs.
 * @param {GetFeatureIndexOptions} [options]
 * @returns {GamefaceFeatureIndex}
 */
export function getFeatureIndex(version, options) {
  const versionKey =
    version === undefined || version === null
      ? DEFAULT_GAMEFACE_VERSION
      : normalizeGamefaceVersionSetting(String(version));
  const applyWhitelist = shouldApplyInternalCatalogWhitelist(options);
  const cacheKey = applyWhitelist ? versionKey : `${versionKey}${RAW_CATALOG_CACHE_SUFFIX}`;
  const hit = cache.get(cacheKey);
  if (hit) {
    return hit;
  }
  const root = resolveGamefaceFeaturesRoot(versionKey);
  const index = buildFeatureIndex(root);
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
}
