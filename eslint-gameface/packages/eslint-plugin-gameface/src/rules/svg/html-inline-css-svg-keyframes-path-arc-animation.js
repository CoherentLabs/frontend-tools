import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import {
  getStyleAttributeInnerRange,
  walkInlineCssContent,
} from "../../utils/html-inline-style-css.js";
import { reportKeyframesPathArcCssTree } from "../../utils/svg-css-keyframes.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn on path d keyframes with elliptical arcs in HTML style attributes.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      pathArc:
        "Animating path 'd' with elliptical arc (A/a) commands may not interpolate correctly in Gameface.",
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
            reportKeyframesPathArcCssTree(context, "pathArc", block, sc, range.baseIndex);
          },
        });
      },
    };
  },
};
