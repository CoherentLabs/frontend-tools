import { SVG_SUPPORT_DOC_URL } from "../../data/gameface-svg-support.js";
import { walkInlineCssContent } from "../../utils/html-inline-style-css.js";
import { walkJsxStyleStringValues } from "../../utils/jsx-inline-style-css.js";
import { reportKeyframesSizingUnitsCssTree } from "../../utils/svg-css-keyframes.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "In JSX style string @keyframes, sizing properties must include units for Gameface SVG animation.",
      url: SVG_SUPPORT_DOC_URL,
    },
    messages: {
      unitless:
        "Keyframe property '{{property}}' must include units (e.g. px) in Gameface SVG animations.",
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
              reportKeyframesSizingUnitsCssTree(
                context,
                "unitless",
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
