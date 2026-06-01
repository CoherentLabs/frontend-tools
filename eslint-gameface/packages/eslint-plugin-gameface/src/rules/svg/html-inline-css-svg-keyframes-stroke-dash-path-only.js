import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  getStyleAttributeInnerRange,
  walkInlineCssContent,
} from "../../utils/html-inline-style-css.js";
import { reportKeyframesStrokeDashPathOnlyCssTree } from "../../utils/svg-stroke-dash.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn on stroke-dash* in @keyframes in HTML style attributes (path-only in Gameface).",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathOnly:
        "Animating '{{property}}' in @keyframes only works on SVG <path> elements in Gameface.",
    },
    schema: [],
  },
  create(context) {
    const sc = context.sourceCode || context.getSourceCode();

    return {
      Tag(node) {
        const styleAttr = (node.attributes || []).find(
          (a) => typeof a.key?.value === "string" && a.key.value.toLowerCase() === "style",
        );
        if (!styleAttr?.value) {
          return;
        }
        const range = getStyleAttributeInnerRange(sc, styleAttr.value);
        if (!range?.inner.trim()) {
          return;
        }
        walkInlineCssContent(sc, range.baseIndex, range.inner, {
          onKeyframesBlock(block) {
            reportKeyframesStrokeDashPathOnlyCssTree(
              context,
              "pathOnly",
              block,
              sc,
              range.baseIndex,
            );
          },
        });
      },
    };
  },
};
