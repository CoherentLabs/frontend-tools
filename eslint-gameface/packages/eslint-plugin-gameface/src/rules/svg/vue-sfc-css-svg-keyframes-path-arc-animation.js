import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { createVueSfcStyleRule } from "../../utils/create-vue-sfc-style-rule.js";
import { reportKeyframesPathArcCssTree } from "../../utils/svg-css-keyframes.js";
import { walkVueSfcInlineCssContent, withVueStyleBlockText } from "../../utils/walk-vue-sfc-style-block.js";

export default createVueSfcStyleRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Warn on path d keyframes with elliptical arcs in Vue `<style>` blocks.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathArc:
        "Animating path 'd' with elliptical arc (A/a) commands may not interpolate correctly in Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withVueStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkVueSfcInlineCssContent(sc, cssText, baseIndex, {
        onKeyframesBlock(block) {
          reportKeyframesPathArcCssTree(context, "pathArc", block, sc, baseIndex);
        },
      });
    });
  },
);
