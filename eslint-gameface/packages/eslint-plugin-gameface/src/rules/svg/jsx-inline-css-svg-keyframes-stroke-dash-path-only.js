import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { walkJsxStyleStringValues } from "../../utils/jsx-inline-style-css.js";
import { reportKeyframesStrokeDashPathOnlyCssTree } from "../../utils/svg-stroke-dash.js";

export default {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Warn on stroke-dash* in @keyframes in JSX style strings (path-only in Gameface).",
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
      JSXAttribute(node) {
        const name = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (name !== "style") {
          return;
        }
        walkJsxStyleStringValues(sc, node, (inner, baseIndex) => {
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
    };
  },
};
