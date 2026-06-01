import htmlParsedNoImpl from "./html-parsed-no-impl.js";
import htmlPartialFeatures from "./html-partial-features.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "html-parsed-no-impl": htmlParsedNoImpl,
  "html-partial-features": htmlPartialFeatures,
};

/** Catalog: gameface-features/html/ */
export const catalog = "html";
