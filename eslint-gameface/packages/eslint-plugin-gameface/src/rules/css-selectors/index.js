import cssNoUnsupportedSelectors from "./css-no-unsupported-selectors.js";
import cssPartialSelectors from "./css-partial-selectors.js";
import htmlEmbeddedCssNoUnsupportedSelectors from "./html-embedded-css-no-unsupported-selectors.js";
import htmlEmbeddedCssPartialSelectors from "./html-embedded-css-partial-selectors.js";
import vueSfcCssNoUnsupportedSelectors from "./vue-sfc-css-no-unsupported-selectors.js";
import vueSfcCssPartialSelectors from "./vue-sfc-css-partial-selectors.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "css-no-unsupported-selectors": cssNoUnsupportedSelectors,
  "css-partial-selectors": cssPartialSelectors,
  "html-embedded-css-no-unsupported-selectors": htmlEmbeddedCssNoUnsupportedSelectors,
  "html-embedded-css-partial-selectors": htmlEmbeddedCssPartialSelectors,
  "vue-sfc-css-no-unsupported-selectors": vueSfcCssNoUnsupportedSelectors,
  "vue-sfc-css-partial-selectors": vueSfcCssPartialSelectors,
};

/** Catalog: gameface-features/selectors/ */
export const catalog = "selectors";
