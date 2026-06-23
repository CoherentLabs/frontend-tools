import cssNoUnsupportedFunctions from "./css-no-unsupported-functions.js";
import htmlEmbeddedCssNoUnsupportedFunctions from "./html-embedded-css-no-unsupported-functions.js";
import htmlInlineCssNoUnsupportedFunctions from "./html-inline-css-no-unsupported-functions.js";
import jsxInlineCssNoUnsupportedFunctions from "./jsx-inline-css-no-unsupported-functions.js";
import vueInlineCssNoUnsupportedFunctions from "./vue-inline-css-no-unsupported-functions.js";
import vueSfcCssNoUnsupportedFunctions from "./vue-sfc-css-no-unsupported-functions.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "css-no-unsupported-functions": cssNoUnsupportedFunctions,
  "html-embedded-css-no-unsupported-functions": htmlEmbeddedCssNoUnsupportedFunctions,
  "html-inline-css-no-unsupported-functions": htmlInlineCssNoUnsupportedFunctions,
  "jsx-inline-css-no-unsupported-functions": jsxInlineCssNoUnsupportedFunctions,
  "vue-inline-css-no-unsupported-functions": vueInlineCssNoUnsupportedFunctions,
  "vue-sfc-css-no-unsupported-functions": vueSfcCssNoUnsupportedFunctions,
};

/** Catalog: gameface-features/functions/unsupported.json (missing rows) */
export const catalog = "functions";
