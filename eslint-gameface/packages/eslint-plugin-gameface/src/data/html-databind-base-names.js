/**
 * Non-style `data-bind-*` attribute names (HTMLLint / cohtmllint parity).
 * `data-bind-style-*` is validated dynamically via gameface-features/css/unsupported.json.
 */
export const HTML_DATABIND_BASE_ATTRIBUTE_NAMES = [
  "data-bind-value",
  "data-bind-class-toggle",
  "data-bind-class",
  "data-bind-if",
  "data-bind-for",
];

/**
 * Full attribute names from legacy HTMLLint allowlist that may not match catalog-only checks.
 * Kept so existing markup keeps validating.
 */
export const HTML_DATABIND_STYLE_LEGACY_FULL_NAMES = [
  "data-bind-style-left",
  "data-bind-style-top",
  "data-bind-style-opacity",
  "data-bind-style-value",
  "data-bind-style-width",
  "data-bind-style-height",
  "data-bind-style-color",
  "data-bind-style-background-color",
  "data-bind-style-background-image-url",
  "data-bind-style-transform2d",
  "data-bind-style-transform-rotate",
];
