import cssNoVarInKeyframes from "./css-no-var-in-keyframes.js";
import cssNoCalcInKeyframes from "./css-no-calc-in-keyframes.js";
import cssVarNoFallback from "./css-var-no-fallback.js";
import cssCalcNoMixedPercentUnits from "./css-calc-no-mixed-percent-units.js";
import htmlEmbeddedCssNoVarInKeyframes from "./html-embedded-css-no-var-in-keyframes.js";
import htmlEmbeddedCssNoCalcInKeyframes from "./html-embedded-css-no-calc-in-keyframes.js";
import htmlEmbeddedCssVarNoFallback from "./html-embedded-css-var-no-fallback.js";
import htmlEmbeddedCssCalcNoMixedPercentUnits from "./html-embedded-css-calc-no-mixed-percent-units.js";
import htmlInlineCssNoVarInKeyframes from "./html-inline-css-no-var-in-keyframes.js";
import htmlInlineCssNoCalcInKeyframes from "./html-inline-css-no-calc-in-keyframes.js";
import htmlInlineCssVarNoFallback from "./html-inline-css-var-no-fallback.js";
import htmlInlineCssCalcNoMixedPercentUnits from "./html-inline-css-calc-no-mixed-percent-units.js";
import jsxInlineCssNoVarInKeyframes from "./jsx-inline-css-no-var-in-keyframes.js";
import jsxInlineCssNoCalcInKeyframes from "./jsx-inline-css-no-calc-in-keyframes.js";
import jsxInlineCssVarNoFallback from "./jsx-inline-css-var-no-fallback.js";
import jsxInlineCssCalcNoMixedPercentUnits from "./jsx-inline-css-calc-no-mixed-percent-units.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "css-no-var-in-keyframes": cssNoVarInKeyframes,
  "css-no-calc-in-keyframes": cssNoCalcInKeyframes,
  "css-var-no-fallback": cssVarNoFallback,
  "css-calc-no-mixed-percent-units": cssCalcNoMixedPercentUnits,
  "html-embedded-css-no-var-in-keyframes": htmlEmbeddedCssNoVarInKeyframes,
  "html-embedded-css-no-calc-in-keyframes": htmlEmbeddedCssNoCalcInKeyframes,
  "html-embedded-css-var-no-fallback": htmlEmbeddedCssVarNoFallback,
  "html-embedded-css-calc-no-mixed-percent-units": htmlEmbeddedCssCalcNoMixedPercentUnits,
  "html-inline-css-no-var-in-keyframes": htmlInlineCssNoVarInKeyframes,
  "html-inline-css-no-calc-in-keyframes": htmlInlineCssNoCalcInKeyframes,
  "html-inline-css-var-no-fallback": htmlInlineCssVarNoFallback,
  "html-inline-css-calc-no-mixed-percent-units": htmlInlineCssCalcNoMixedPercentUnits,
  "jsx-inline-css-no-var-in-keyframes": jsxInlineCssNoVarInKeyframes,
  "jsx-inline-css-no-calc-in-keyframes": jsxInlineCssNoCalcInKeyframes,
  "jsx-inline-css-var-no-fallback": jsxInlineCssVarNoFallback,
  "jsx-inline-css-calc-no-mixed-percent-units": jsxInlineCssCalcNoMixedPercentUnits,
};

/** Gameface documentation constraints (not driven by feature JSON). */
export const catalog = "doc-restrictions";

/**
 * Flat config severities for `flat/recommended` (all error).
 * @returns {Record<string, import("eslint").Linter.RuleSeverity>}
 */
export function flatRecommendedConfig() {
  return Object.fromEntries(
    Object.keys(rules).map((id) => [`gameface/${id}`, "error"]),
  );
}
