import { rules as cssPropertiesRules } from "./css-properties/index.js";
import { rules as cssSelectorsRules } from "./css-selectors/index.js";
import { rules as cssFunctionsRules } from "./css-functions/index.js";
import { rules as cssRestrictionsRules } from "./css-restrictions/index.js";
import { rules as htmlRules } from "./html/index.js";
import { rules as databindRules } from "./databind/index.js";
import { rules as jsApiRules } from "./js-api/index.js";
import { rules as svgRules } from "./svg/index.js";
import { rules as vueRules } from "./vue/index.js";
import { rules as svelteRules } from "./svelte/index.js";

export { rules as cssPropertiesRules } from "./css-properties/index.js";
export { rules as cssSelectorsRules } from "./css-selectors/index.js";
export { rules as cssFunctionsRules } from "./css-functions/index.js";
export { rules as cssRestrictionsRules, flatRecommendedConfig as cssRestrictionsFlatRecommended } from "./css-restrictions/index.js";
export { rules as htmlRules } from "./html/index.js";
export { rules as databindRules } from "./databind/index.js";
export { rules as jsApiRules } from "./js-api/index.js";
export { rules as svgRules, flatRecommendedConfig as svgFlatRecommended } from "./svg/index.js";
export { rules as vueRules } from "./vue/index.js";
export { rules as svelteRules } from "./svelte/index.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const allRules = {
  ...cssPropertiesRules,
  ...cssSelectorsRules,
  ...cssFunctionsRules,
  ...cssRestrictionsRules,
  ...htmlRules,
  ...databindRules,
  ...jsApiRules,
  ...svgRules,
  ...vueRules,
  ...svelteRules,
};
