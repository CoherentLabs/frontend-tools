import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { createSvelteSfcStyleRule } from "../../utils/create-svelte-sfc-style-rule.js";
import { reportKeyframesStrokeDashPathOnlyCssTree } from "../../utils/svg-stroke-dash.js";
import { walkSvelteSfcInlineCssContent, withSvelteStyleBlockText } from "../../utils/walk-svelte-sfc-style-block.js";

export default createSvelteSfcStyleRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Warn on stroke-dash* in @keyframes inside Svelte `<style>` blocks (path-only in Gameface).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathOnly:
        "Animating '{{property}}' in @keyframes only works on SVG <path> elements in Gameface.",
    },
    schema: [],
  },
  (context, sc, styleElement) => {
    withSvelteStyleBlockText(styleElement, sc, (cssText, baseIndex) => {
      walkSvelteSfcInlineCssContent(sc, cssText, baseIndex, {
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
