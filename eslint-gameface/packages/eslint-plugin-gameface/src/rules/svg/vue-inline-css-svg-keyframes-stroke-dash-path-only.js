import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { createVueInlineStyleRule } from "../../utils/create-vue-inline-style-rule.js";
import { walkVueStyleStringValues } from "../../utils/vue-inline-style-css.js";
import { reportKeyframesStrokeDashPathOnlyCssTree } from "../../utils/svg-stroke-dash.js";

export default createVueInlineStyleRule(
  {
    type: "suggestion",
    docs: {
      description:
        "Warn on stroke-dash* in @keyframes in Vue style strings (path-only in Gameface).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathOnly:
        "Animating '{{property}}' in @keyframes only works on SVG <path> elements in Gameface.",
    },
    schema: [],
  },
  (context, sc, attr) => {
    walkVueStyleStringValues(sc, attr, (inner, baseIndex) => {
      walkInlineCssContent(sc, baseIndex, inner, {
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
