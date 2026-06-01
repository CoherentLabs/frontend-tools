/**
 * Internal overrides for collector false positives. Applied when building the
 * feature index (all catalog-driven rules). Edit this file when the collector
 * is wrong until JSON is regenerated; not exposed in ESLint settings.
 *
 * @typedef {import("../utils/catalog-whitelist.js").CatalogWhitelists} CatalogWhitelists
 */

/** @type {CatalogWhitelists} */
export const DEFAULT_CATALOG_WHITELISTS = {
  cssPropertiesUnsupported: [],
  cssPropertiesPartial: [],
  cssPartialKeywords: {},
  cssFunctionsUnsupported: [],
  selectorsUnsupported: [],
  selectorsPartial: [],
  htmlParsedNoImpl: [],
  htmlPartial: [],
  jsApisUnsupported: [],
  jsPartialMembers: {
    /** CSS unit helpers are supported; collector lists them under `evidence.missing`. */
    CSS: [
      "deg",
      "em",
      "in",
      "ms",
      "number",
      "percent",
      "pt",
      "px",
      "rem",
      "s",
      "vh",
      "vmax",
      "vmin",
      "vw",
    ],
  },
};
