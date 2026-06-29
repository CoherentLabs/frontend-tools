import vueParsedNoImpl from "./vue-parsed-no-impl.js";
import vuePartialFeatures from "./vue-partial-features.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "vue-parsed-no-impl": vueParsedNoImpl,
  "vue-partial-features": vuePartialFeatures,
};

export const catalog = "html";
