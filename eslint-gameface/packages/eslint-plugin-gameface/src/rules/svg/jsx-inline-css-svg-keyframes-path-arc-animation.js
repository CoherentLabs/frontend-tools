import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { walkJsxStyleStringValues } from "../../utils/jsx-inline-style-css.js";
import { reportKeyframesPathArcCssTree } from "../../utils/svg-css-keyframes.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn on path d keyframes with elliptical arcs in JSX style strings.",
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
      JSXAttribute(node) {
        const name = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (name !== "style") {
          return;
        }
        walkJsxStyleStringValues(sc, node, (inner, baseIndex) => {
          walkInlineCssContent(sc, baseIndex, inner, {
            onKeyframesBlock(block) {
              reportKeyframesPathArcCssTree(context, "pathArc", block, sc, baseIndex);
            },
          });
        });
      },
    };
  },
};
