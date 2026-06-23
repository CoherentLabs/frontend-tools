import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { createVueSfcStyleRule } from "../../utils/create-vue-sfc-style-rule.js";
import { reportKeyframesStrokeDashPathOnlyCssTree } from "../../utils/svg-stroke-dash.js";
import { walkVueSfcInlineCssContent, withVueStyleBlockText } from "../../utils/walk-vue-sfc-style-block.js";

export default createVueSfcStyleRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Warn on stroke-dash* in @keyframes inside Vue `<style>` blocks (path-only in Gameface).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathOnly:
        "Animating '{{property}}' in @keyframes only works on SVG <path> elements in Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withVueStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkVueSfcInlineCssContent(sc, cssText, baseIndex, {
        onKeyframesBlock(block) {
          reportKeyframesStrokeDashPathOnlyCssTree(
            context,
            "pathOnly",
            block,
            sc,
            baseIndex,
          );
        },
      });
    });
  },
);
