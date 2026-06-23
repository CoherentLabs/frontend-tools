import cssNoUnsupportedProperties from "./css-no-unsupported-properties.js";
import cssPartialPropertyValues from "./css-partial-property-values.js";
import htmlEmbeddedCssNoUnsupportedProperties from "./html-embedded-css-no-unsupported-properties.js";
import htmlEmbeddedCssPartialPropertyValues from "./html-embedded-css-partial-property-values.js";
import htmlInlineCssNoUnsupportedProperties from "./html-inline-css-no-unsupported-properties.js";
import htmlInlineCssPartialPropertyValues from "./html-inline-css-partial-property-values.js";
import jsxInlineCssNoUnsupportedProperties from "./jsx-inline-css-no-unsupported-properties.js";
import jsxInlineCssPartialPropertyValues from "./jsx-inline-css-partial-property-values.js";
import vueInlineCssNoUnsupportedProperties from "./vue-inline-css-no-unsupported-properties.js";
import vueInlineCssPartialPropertyValues from "./vue-inline-css-partial-property-values.js";
import vueSfcCssNoUnsupportedProperties from "./vue-sfc-css-no-unsupported-properties.js";
import vueSfcCssPartialPropertyValues from "./vue-sfc-css-partial-property-values.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "css-no-unsupported-properties": cssNoUnsupportedProperties,
  "css-partial-property-values": cssPartialPropertyValues,
  "html-embedded-css-no-unsupported-properties": htmlEmbeddedCssNoUnsupportedProperties,
  "html-embedded-css-partial-property-values": htmlEmbeddedCssPartialPropertyValues,
  "html-inline-css-no-unsupported-properties": htmlInlineCssNoUnsupportedProperties,
  "html-inline-css-partial-property-values": htmlInlineCssPartialPropertyValues,
  "jsx-inline-css-no-unsupported-properties": jsxInlineCssNoUnsupportedProperties,
  "jsx-inline-css-partial-property-values": jsxInlineCssPartialPropertyValues,
  "vue-inline-css-no-unsupported-properties": vueInlineCssNoUnsupportedProperties,
  "vue-inline-css-partial-property-values": vueInlineCssPartialPropertyValues,
  "vue-sfc-css-no-unsupported-properties": vueSfcCssNoUnsupportedProperties,
  "vue-sfc-css-partial-property-values": vueSfcCssPartialPropertyValues,
};

/** Catalog: gameface-features/css/ */
export const catalog = "css";
