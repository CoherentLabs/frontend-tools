import htmlSvgNoUnsupportedElements from "./html-svg-no-unsupported-elements.js";
import jsxSvgNoUnsupportedElements from "./jsx-svg-no-unsupported-elements.js";
import htmlSvgMaskClipPathConflict from "./html-svg-mask-clip-path-conflict.js";
import jsxSvgMaskClipPathConflict from "./jsx-svg-mask-clip-path-conflict.js";
import htmlSvgTspanIgnored from "./html-svg-tspan-ignored.js";
import cssSvgKeyframesSizingUnits from "./css-svg-keyframes-sizing-units.js";
import htmlEmbeddedCssSvgKeyframesSizingUnits from "./html-embedded-css-svg-keyframes-sizing-units.js";
import htmlInlineCssSvgKeyframesSizingUnits from "./html-inline-css-svg-keyframes-sizing-units.js";
import jsxInlineCssSvgKeyframesSizingUnits from "./jsx-inline-css-svg-keyframes-sizing-units.js";
import cssSvgKeyframesPathArcAnimation from "./css-svg-keyframes-path-arc-animation.js";
import htmlEmbeddedCssSvgKeyframesPathArcAnimation from "./html-embedded-css-svg-keyframes-path-arc-animation.js";
import htmlInlineCssSvgKeyframesPathArcAnimation from "./html-inline-css-svg-keyframes-path-arc-animation.js";
import jsxInlineCssSvgKeyframesPathArcAnimation from "./jsx-inline-css-svg-keyframes-path-arc-animation.js";
import htmlSvgStrokeDashNonPath from "./html-svg-stroke-dash-non-path.js";
import jsxSvgStrokeDashNonPath from "./jsx-svg-stroke-dash-non-path.js";
import cssSvgStrokeDashNonPath from "./css-svg-stroke-dash-non-path.js";
import htmlEmbeddedCssSvgStrokeDashNonPath from "./html-embedded-css-svg-stroke-dash-non-path.js";
import cssSvgKeyframesStrokeDashPathOnly from "./css-svg-keyframes-stroke-dash-path-only.js";
import htmlEmbeddedCssSvgKeyframesStrokeDashPathOnly from "./html-embedded-css-svg-keyframes-stroke-dash-path-only.js";
import htmlInlineCssSvgKeyframesStrokeDashPathOnly from "./html-inline-css-svg-keyframes-stroke-dash-path-only.js";
import jsxInlineCssSvgKeyframesStrokeDashPathOnly from "./jsx-inline-css-svg-keyframes-stroke-dash-path-only.js";

/** @type {import("eslint").ESLint.Plugin["rules"]} */
export const rules = {
  "html-svg-no-unsupported-elements": htmlSvgNoUnsupportedElements,
  "jsx-svg-no-unsupported-elements": jsxSvgNoUnsupportedElements,
  "html-svg-mask-clip-path-conflict": htmlSvgMaskClipPathConflict,
  "jsx-svg-mask-clip-path-conflict": jsxSvgMaskClipPathConflict,
  "html-svg-tspan-ignored": htmlSvgTspanIgnored,
  "css-svg-keyframes-sizing-units": cssSvgKeyframesSizingUnits,
  "html-embedded-css-svg-keyframes-sizing-units": htmlEmbeddedCssSvgKeyframesSizingUnits,
  "html-inline-css-svg-keyframes-sizing-units": htmlInlineCssSvgKeyframesSizingUnits,
  "jsx-inline-css-svg-keyframes-sizing-units": jsxInlineCssSvgKeyframesSizingUnits,
  "css-svg-keyframes-path-arc-animation": cssSvgKeyframesPathArcAnimation,
  "html-embedded-css-svg-keyframes-path-arc-animation": htmlEmbeddedCssSvgKeyframesPathArcAnimation,
  "html-inline-css-svg-keyframes-path-arc-animation": htmlInlineCssSvgKeyframesPathArcAnimation,
  "jsx-inline-css-svg-keyframes-path-arc-animation": jsxInlineCssSvgKeyframesPathArcAnimation,
  "html-svg-stroke-dash-non-path": htmlSvgStrokeDashNonPath,
  "jsx-svg-stroke-dash-non-path": jsxSvgStrokeDashNonPath,
  "css-svg-stroke-dash-non-path": cssSvgStrokeDashNonPath,
  "html-embedded-css-svg-stroke-dash-non-path": htmlEmbeddedCssSvgStrokeDashNonPath,
  "css-svg-keyframes-stroke-dash-path-only": cssSvgKeyframesStrokeDashPathOnly,
  "html-embedded-css-svg-keyframes-stroke-dash-path-only":
    htmlEmbeddedCssSvgKeyframesStrokeDashPathOnly,
  "html-inline-css-svg-keyframes-stroke-dash-path-only":
    htmlInlineCssSvgKeyframesStrokeDashPathOnly,
  "jsx-inline-css-svg-keyframes-stroke-dash-path-only":
    jsxInlineCssSvgKeyframesStrokeDashPathOnly,
};

export const catalog = "doc-svg-support";

/**
 * @returns {Record<string, import("eslint").Linter.RuleEntry>}
 */
export function flatRecommendedConfig() {
  return {
    "gameface/html-svg-no-unsupported-elements": "error",
    "gameface/jsx-svg-no-unsupported-elements": "error",
    "gameface/html-svg-mask-clip-path-conflict": "warn",
    "gameface/jsx-svg-mask-clip-path-conflict": "warn",
    "gameface/html-svg-tspan-ignored": "off",
    "gameface/css-svg-keyframes-sizing-units": "error",
    "gameface/html-embedded-css-svg-keyframes-sizing-units": "error",
    "gameface/html-inline-css-svg-keyframes-sizing-units": "error",
    "gameface/jsx-inline-css-svg-keyframes-sizing-units": "error",
    "gameface/css-svg-keyframes-path-arc-animation": "warn",
    "gameface/html-embedded-css-svg-keyframes-path-arc-animation": "warn",
    "gameface/html-inline-css-svg-keyframes-path-arc-animation": "warn",
    "gameface/jsx-inline-css-svg-keyframes-path-arc-animation": "warn",
    "gameface/html-svg-stroke-dash-non-path": "error",
    "gameface/jsx-svg-stroke-dash-non-path": "error",
    "gameface/css-svg-stroke-dash-non-path": "error",
    "gameface/html-embedded-css-svg-stroke-dash-non-path": "error",
    "gameface/css-svg-keyframes-stroke-dash-path-only": "warn",
    "gameface/html-embedded-css-svg-keyframes-stroke-dash-path-only": "warn",
    "gameface/html-inline-css-svg-keyframes-stroke-dash-path-only": "warn",
    "gameface/jsx-inline-css-svg-keyframes-stroke-dash-path-only": "warn",
  };
}
