import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import { reportKeyframesPathArcCssTree } from "../../utils/svg-css-keyframes.js";
import { walkSvelteSfcInlineCssContent, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Warn on path d keyframes with elliptical arcs in Svelte `<style>` blocks.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathArc:
        "Animating path 'd' with elliptical arc (A/a) commands may not interpolate correctly in Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcInlineCssContent(sc, cssText, baseIndex, {
        onKeyframesBlock(block) {
          reportKeyframesPathArcCssTree(context, "pathArc", block, sc, baseIndex);
        },
      });
    });
  },
);
